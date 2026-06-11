import os
import json
import uuid
import httpx
from datetime import datetime
from google import genai
from google.genai import types
from models import BagIdentificationResult
from duckduckgo_search import DDGS
from services.db_service import upload_image

def _fetch_and_upload_image(query: str, fallback_url: str) -> str:
    try:
        results = DDGS().images(query, max_results=1)
        if results and len(results) > 0:
            image_url = results[0].get('image')
            if image_url:
                with httpx.Client(timeout=10.0) as client:
                    resp = client.get(image_url, follow_redirects=True)
                    resp.raise_for_status()
                    image_bytes = resp.content
                    content_type = resp.headers.get("Content-Type", "image/jpeg")
                    filename = f"ref_{uuid.uuid4().hex[:8]}.jpg"
                    
                    bucket_url = upload_image(image_bytes, filename, content_type)
                    if bucket_url:
                        return bucket_url
    except Exception as e:
        print(f"Error fetching/uploading image for query '{query}': {e}")
    return fallback_url

def identify_bag(image_bytes: bytes, mime_type: str) -> BagIdentificationResult:
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
    For 'referenceImages' and 'alternativeMatches' imageUrls, provide placeholders as we will replace them.
    Crucially, generate a 'sources' array with purchase/reference links. The first item MUST ALWAYS be the official brand site (e.g., Louis Vuitton official site). The following items should be structured search links or known links to Amazon, eBay, Alibaba, and other international shopping sites.
    
    Structure:
    {
      "brand": "Brand Name (e.g., Louis Vuitton)",
      "model": "Model Name and Product Code if known",
      "category": "Category (e.g., Tote Bag, Crossbody)",
      "priceLow": integer (e.g., 1500),
      "priceHigh": integer (e.g., 2200),
      "currency": "USD",
      "confidence": integer from 0 to 100,
      "referenceImages": [
        { "id": "r1", "url": "https://...", "caption": "Front view" },
        { "id": "r2", "url": "https://...", "caption": "Side view" }
      ],
      "alternativeMatches": [
        { "id": "a1", "brand": "Brand", "model": "Model", "confidence": 80, "imageUrl": "https://..." }
      ],
      "sources": [
        { "name": "Official Site (Louis Vuitton)", "url": "https://us.louisvuitton.com/eng-us/search/..." },
        { "name": "eBay", "url": "https://www.ebay.com/sch/i.html?_nkw=..." },
        { "name": "Amazon", "url": "https://www.amazon.com/s?k=..." },
        { "name": "Alibaba", "url": "https://www.alibaba.com/trade/search?SearchText=..." }
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
        
        # Add generated fields
        data['id'] = f"scan_{int(datetime.utcnow().timestamp())}_{str(uuid.uuid4())[:6]}"
        data['createdAt'] = datetime.utcnow().isoformat() + "Z"
        
        # Post-process images: replace hallucinated URLs with real ones stored in Supabase
        brand = data.get("brand", "")
        model = data.get("model", "")
        
        for ref in data.get("referenceImages", []):
            caption = ref.get("caption", "handbag")
            query = f"{brand} {model} {caption} high quality"
            ref["url"] = _fetch_and_upload_image(query, "/placeholder.svg")
            
        for alt in data.get("alternativeMatches", []):
            alt_brand = alt.get("brand", brand)
            alt_model = alt.get("model", "")
            query = f"{alt_brand} {alt_model} handbag"
            alt["imageUrl"] = _fetch_and_upload_image(query, "/placeholder.svg")

        return BagIdentificationResult(**data)
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return _mock_response()

def _mock_response() -> BagIdentificationResult:
    return BagIdentificationResult(
        id=f"scan_{int(datetime.utcnow().timestamp())}_mock",
        brand="Hermès",
        model="Birkin 30 Togo Leather",
        category="Tote Bag",
        priceLow=15000,
        priceHigh=25000,
        currency="USD",
        confidence=98,
        referenceImages=[
            {"id": "r1", "url": "/bags/reference-1.png", "caption": "Front view"},
            {"id": "r2", "url": "/bags/reference-2.png", "caption": "Interior detail"},
        ],
        alternativeMatches=[
            {"id": "a1", "brand": "Hermès", "model": "Kelly 28", "confidence": 75, "imageUrl": "/bags/alt-1.png"}
        ],
        sources=[
            {"name": "Official Site (Hermès)", "url": "https://www.hermes.com/us/en/"},
            {"name": "eBay", "url": "https://www.ebay.com/sch/i.html?_nkw=Hermes+Birkin+30"},
            {"name": "Amazon", "url": "https://www.amazon.com/s?k=Hermes+Birkin+30"}
        ],
        createdAt=datetime.utcnow().isoformat() + "Z"
    )
