import os
import re
import json
import uuid
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import httpx

from google import genai
from google.genai import types
from duckduckgo_search import DDGS
from models import BagIdentificationResult, ShoppingSource
from services.db_service import upload_image

def _clean_model_for_search(model: str) -> str:
    """Strip product codes (anything in parens/brackets) and truncate to 40 chars."""
    clean = re.sub(r'\s*[\(\[]\S+[\)\]]', '', model).strip()
    return clean[:40]

def get_real_bag_images(brand: str, model: str, max_results: int = 4) -> list:
    query = f"{brand} {model} handbag"
    try:
        results = DDGS().images(query, max_results=max_results)
        return [r.get("image") for r in results if r.get("image")]
    except Exception as e:
        print(f"DDGS error: {e}")
        return []


def identify_bag(image_bytes: bytes, mime_type: str, uploaded_image_url: str = None) -> BagIdentificationResult:
    from dotenv import load_dotenv
    import os
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local')
    load_dotenv(dotenv_path=env_path, override=True)
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

        bag_image_urls = get_real_bag_images(brand, model_short, max_results=4)
        for i, ref in enumerate(ref_images):
            if i < len(bag_image_urls):
                ref["url"] = bag_image_urls[i]
            else:
                ref["url"] = fallback_source_url

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
