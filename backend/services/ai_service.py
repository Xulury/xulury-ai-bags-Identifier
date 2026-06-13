import os
import re
import json
import uuid
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

from google import genai
from google.genai import types
from models import BagIdentificationResult, ShoppingSource
from services.db_service import get_client

def _clean_model_for_search(model: str) -> str:
    """Strip product codes (anything in parens/brackets) and truncate to 40 chars."""
    clean = re.sub(r'\s*[\(\[]\S+[\)\]]', '', model).strip()
    return clean[:40]

def get_db_product_images(brand: str, model: str) -> list:
    """Fetch product images from DB matching brand and model."""
    supabase = get_client()
    if not supabase:
        return []
        
    try:
        # Basic matching: we assume we might have a product record
        # For a robust implementation, full text search or trigram matching is better
        res = supabase.table("products").select("id").ilike("canonical_brand", f"%{brand}%").ilike("canonical_model", f"%{model}%").execute()
        if not res.data:
            return []
            
        product_id = res.data[0]["id"]
        img_res = supabase.table("product_images").select("*").eq("product_id", product_id).eq("is_active", True).order("sort_order").execute()
        
        return img_res.data or []
    except Exception as e:
        print(f"Error fetching product images from DB: {e}")
        return []

def identify_bag(scan_id: str, image_bytes: bytes, mime_type: str, uploaded_image_url: str = None) -> BagIdentificationResult:
    from dotenv import load_dotenv
    import os
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local')
    load_dotenv(dotenv_path=env_path, override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not set. Using mock response.")
        return _mock_response(scan_id)
    
    client = genai.Client(api_key=api_key)

    prompt = """
    You are an expert luxury handbag identifier and appraiser.

    STEP 1 — Is this a handbag?
    First, check whether the image contains a handbag, purse, clutch, or luxury bag.
    If the image does NOT show any kind of bag, return ONLY this JSON (nothing else):
    {
      "is_bag": false,
      "not_bag_reason": "One short sentence describing what the image actually shows."
    }

    STEP 2 — If it IS a handbag, analyze and identify it.
    Return a JSON object with "is_bag": true plus ALL fields below.
    If you are unsure of exact details, provide your best educated estimate.

    For 'model': use the SHORT common name only (e.g. "Neverfull MM", "Lady Dior Medium"). Do NOT include product codes.
    For 'referenceImages': provide EXACTLY 4 items covering these specific views: "Front view", "Side view", "Back view", "Close up". Use placeholder URLs.
    For 'alternativeMatches': provide 2-3 similar bags. Use placeholder imageUrls.
    For 'sources': provide 5-6 shopping sources with REALISTIC data for each platform.
      Include: official brand site, eBay, Amazon, Farfetch, Vestiaire Collective, and The RealReal.
      For each source provide: a real or structured search URL, a realistic listing title, a price string, and a typical rating (null for official sites).

    Structure:
    {
      "is_bag": true,
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

        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        try:
            raw_data = json.loads(text.strip())
        except Exception:
            raw_data = {}

        # Reject non-bag images before doing any further processing
        if raw_data.get("is_bag") is False:
            from fastapi import HTTPException
            reason = raw_data.get("not_bag_reason") or "This doesn't appear to be a handbag."
            raise HTTPException(status_code=400, detail=reason)

        data = {}
        data['id'] = scan_id
        data['createdAt'] = datetime.utcnow().isoformat() + "Z"

        data['brand'] = raw_data.get("brand") or "Unknown Brand"
        data['model'] = raw_data.get("model") or "Unknown Model"
        data['category'] = raw_data.get("category") or "Handbag"
        data['currency'] = raw_data.get("currency") or "USD"

        for key in ["priceLow", "priceHigh", "confidence"]:
            val = raw_data.get(key)
            if isinstance(val, str):
                data[key] = int(re.sub(r'[^\d]', '', val) or 0)
            elif val is None:
                data[key] = 0
            else:
                try:
                    data[key] = int(val)
                except:
                    data[key] = 0

        fallback_source_url = uploaded_image_url if uploaded_image_url else "/placeholder.svg"

        alt_matches = raw_data.get("alternativeMatches", [])
        if not isinstance(alt_matches, list):
            alt_matches = []
        valid_alts = []
        for i, alt in enumerate(alt_matches):
            if not isinstance(alt, dict): continue
            conf = alt.get("confidence")
            if isinstance(conf, str):
                conf = int(re.sub(r'[^\d]', '', conf) or 0)
            elif conf is None:
                conf = 80
            else:
                try: conf = int(conf)
                except: conf = 80
            
            valid_alts.append({
                "id": alt.get("id") or f"a{i}",
                "brand": alt.get("brand") or "Unknown",
                "model": alt.get("model") or "Unknown",
                "confidence": conf,
                "imageUrl": fallback_source_url
            })

        sources = raw_data.get("sources", [])
        if not isinstance(sources, list):
            sources = []
        valid_sources = []
        for src in sources:
            if not isinstance(src, dict): continue
            valid_sources.append({
                "sourceName": src.get("sourceName") or "Web",
                "brand": src.get("brand") or data["brand"],
                "bagName": src.get("bagName") or data["model"],
                "price": str(src.get("price") or ""),
                "rating": src.get("rating") if isinstance(src.get("rating"), (int, float)) else None,
                "url": src.get("url") or "#",
                "imageUrl": fallback_source_url
            })

        model_short = _clean_model_for_search(data["model"])
        db_images = get_db_product_images(data["brand"], model_short)
        ref_images = []
        for i, img in enumerate(db_images):
            if img.get("image_url"):
                ref_images.append({
                    "id": str(img.get("id")),
                    "url": img.get("image_url"),
                    "caption": img.get("label") or img.get("view_type") or "Detail"
                })

        if not ref_images and uploaded_image_url:
            ref_images.append({
                "id": "fallback-scan",
                "url": uploaded_image_url,
                "caption": "Scanned Image"
            })

        data["referenceImages"] = ref_images
        data["alternativeMatches"] = valid_alts
        data["sources"] = valid_sources
        data["uploadedImage"] = uploaded_image_url

        return BagIdentificationResult(**data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error calling Gemini API: {e}")
        return _mock_response(scan_id)


def _mock_response(scan_id: str) -> BagIdentificationResult:
    return BagIdentificationResult(
        id=scan_id,
        brand="Hermès",
        model="Birkin 30",
        category="Tote Bag",
        priceLow=15000,
        priceHigh=25000,
        currency="USD",
        confidence=98,
        referenceImages=[],
        alternativeMatches=[
            {"id": "a1", "brand": "Hermès", "model": "Kelly 28", "confidence": 75, "imageUrl": "/placeholder.svg"}
        ],
        sources=[
            ShoppingSource(
                sourceName="Official Site",
                brand="Hermès",
                bagName="Birkin 30 Bag in Togo Leather",
                imageUrl="/placeholder.svg",
                price="$11,400+",
                rating=None,
                url="https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/bags-and-clutches/"
            ),
            ShoppingSource(
                sourceName="eBay",
                brand="Hermès",
                bagName="Hermès Birkin 30 Togo Gold – Authentic",
                imageUrl="/placeholder.svg",
                price="$15,000 – $22,000",
                rating=4.9,
                url="https://www.ebay.com/sch/i.html?_nkw=hermes+birkin+30+togo&_sacat=169291"
            )
        ],
        createdAt=datetime.utcnow().isoformat() + "Z"
    )
