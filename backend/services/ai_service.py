import os
import re
import json
import uuid
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import httpx

from google import genai
from google.genai import types
from openai import OpenAI
from models import BagIdentificationResult, ShoppingSource
from services.db_service import upload_image


def _clean_model_for_search(model: str) -> str:
    """Strip product codes (anything in parens/brackets) and truncate to 40 chars."""
    clean = re.sub(r'\s*[\(\[]\S+[\)\]]', '', model).strip()
    return clean[:40]


def _generate_and_cache_image(prompt: str, fallback_url: str) -> str:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return fallback_url
        
    try:
        client = OpenAI(api_key=api_key)
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        
        # Cache to Supabase to prevent URL expiration (OpenAI URLs expire in 2h)
        try:
            with httpx.Client(timeout=10.0) as http_client:
                resp = http_client.get(image_url, follow_redirects=True)
                resp.raise_for_status()
                image_bytes = resp.content
                content_type = resp.headers.get("Content-Type", "image/png")
                filename = f"gen_{uuid.uuid4().hex[:8]}.png"
                bucket_url = upload_image(image_bytes, filename, content_type)
                if bucket_url:
                    return bucket_url
        except Exception as e:
            print(f"Failed to cache generated image: {e}")
            
        return image_url
    except Exception as e:
        print(f"OpenAI Image generation failed: {e}")
        return fallback_url


def identify_bag(image_bytes: bytes, mime_type: str, uploaded_image_url: str = None) -> BagIdentificationResult:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not set. Using mock response.")
        return _mock_response()

    client = genai.Client(api_key=api_key)

    prompt = """
    You are an expert luxury handbag identifier and appraiser.
    Analyze this image and identify the handbag.
    Return a JSON object that EXACTLY matches the following structure.
    If you are unsure of exact details, provide your best educated estimate.

    For 'model': use the SHORT common name only (e.g. "Neverfull MM", "Lady Dior Medium"). Do NOT include product codes.
    For 'referenceImages': provide EXACTLY 4 items covering these specific views: "Front view", "Side view", "Back view", "Close up". Use placeholder URLs.
    For 'alternativeMatches': provide 2-3 similar bags. Use placeholder imageUrls.
    For 'sources': provide 5-6 shopping sources with REALISTIC data for each platform.
      Include: official brand site, eBay, Amazon, Farfetch, Vestiaire Collective, and The RealReal.
      For each source provide: a real or structured search URL, a realistic listing title, a price string, and a typical rating (null for official sites).

    Structure:
    {
      "brand": "Brand Name",
      "model": "Short Model Name",
      "category": "Category (e.g., Tote Bag, Crossbody, Shoulder Bag)",
      "priceLow": integer,
      "priceHigh": integer,
      "currency": "USD",
      "confidence": integer from 0 to 100,
      "referenceImages": [
        { "id": "r1", "url": "placeholder", "caption": "Front view" },
        { "id": "r2", "url": "placeholder", "caption": "Side view" },
        { "id": "r3", "url": "placeholder", "caption": "Back view" },
        { "id": "r4", "url": "placeholder", "caption": "Close up" }
      ],
      "alternativeMatches": [
        { "id": "a1", "brand": "Brand", "model": "Model", "confidence": 80, "imageUrl": "placeholder" }
      ],
      "sources": [
        {
          "sourceName": "Official Site",
          "brand": "Louis Vuitton",
          "bagName": "Neverfull MM Tote in Monogram Canvas",
          "imageUrl": "placeholder",
          "price": "$1,690",
          "rating": null,
          "url": "https://us.louisvuitton.com/eng-us/products/neverfull-mm-monogram-canvas"
        }
      ]
    }
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        data = json.loads(response.text)

        data['id'] = f"scan_{int(datetime.utcnow().timestamp())}_{str(uuid.uuid4())[:6]}"
        data['createdAt'] = datetime.utcnow().isoformat() + "Z"

        brand = data.get("brand", "")
        model_name = data.get("model", "")
        model_short = _clean_model_for_search(model_name)

        ref_images = data.get("referenceImages", [])
        alt_matches = data.get("alternativeMatches", [])
        sources = data.get("sources", [])

        # Ensure exactly 4 reference images as requested by the user
        if len(ref_images) > 4:
            ref_images = ref_images[:4]

        # Use the uploaded image for alternative matches and sources
        fallback_source_url = uploaded_image_url if uploaded_image_url else "/placeholder.svg"

        for alt in alt_matches:
            alt["imageUrl"] = fallback_source_url

        for src in sources:
            src["imageUrl"] = fallback_source_url

        def fetch_ref_image(ref):
            caption = ref.get("caption", "handbag")
            prompt_str = f"A high-quality, realistic, professional studio product photography shot of the luxury handbag: {brand} {model_short}. View: {caption}. Plain white background, luxurious lighting, hyperrealistic, no extra text or logos."
            ref["url"] = _generate_and_cache_image(prompt_str, "/placeholder.svg")
            return ref

        # Generate the 4 reference images concurrently using DALL-E
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {executor.submit(fetch_ref_image, ref): i for i, ref in enumerate(ref_images)}
            for future in as_completed(futures):
                idx = futures[future]
                try:
                    ref_images[idx] = future.result()
                except Exception as e:
                    print(f"Image generation error ({idx}): {e}")

        data["referenceImages"] = ref_images
        data["alternativeMatches"] = alt_matches
        data["sources"] = sources

        return BagIdentificationResult(**data)

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return _mock_response()


def _mock_response() -> BagIdentificationResult:
    return BagIdentificationResult(
        id=f"scan_{int(datetime.utcnow().timestamp())}_mock",
        brand="Hermès",
        model="Birkin 30",
        category="Tote Bag",
        priceLow=15000,
        priceHigh=25000,
        currency="USD",
        confidence=98,
        referenceImages=[
            {"id": "r1", "url": "/bags/reference-1.png", "caption": "Front view"},
            {"id": "r2", "url": "/bags/reference-2.png", "caption": "Side view"},
            {"id": "r3", "url": "/bags/reference-3.png", "caption": "Back view"},
            {"id": "r4", "url": "/bags/reference-4.png", "caption": "Close up"},
        ],
        alternativeMatches=[
            {"id": "a1", "brand": "Hermès", "model": "Kelly 28", "confidence": 75, "imageUrl": "/bags/alt-1.png"}
        ],
        sources=[
            ShoppingSource(
                sourceName="Official Site",
                brand="Hermès",
                bagName="Birkin 30 Bag in Togo Leather",
                imageUrl="/bags/reference-1.png",
                price="$11,400+",
                rating=None,
                url="https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/bags-and-clutches/"
            ),
            ShoppingSource(
                sourceName="eBay",
                brand="Hermès",
                bagName="Hermès Birkin 30 Togo Gold – Authentic",
                imageUrl="/bags/reference-2.png",
                price="$15,000 – $22,000",
                rating=4.9,
                url="https://www.ebay.com/sch/i.html?_nkw=hermes+birkin+30+togo&_sacat=169291"
            )
        ],
        createdAt=datetime.utcnow().isoformat() + "Z"
    )
