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
from services.og_image_service import search_product_images

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
    You are an expert luxury handbag identifier and appraiser with deep knowledge of
    official brand catalogs, materials, and specifications.

    STEP 1 — Is this a handbag?
    Check whether the image contains a handbag, purse, clutch, or luxury bag.
    If it does NOT, return ONLY this JSON (nothing else):
    {
      "is_bag": false,
      "not_bag_reason": "One short sentence describing what the image actually shows."
    }

    STEP 2 — If it IS a handbag, apply these DISAMBIGUATION RULES before finalizing:

    A. When the same material/canvas appears across many models of one brand
       (e.g., Louis Vuitton Monogram Canvas covers Neverfull, Speedy, Alma, Artsy,
       OnTheGo, Palermo, Totally, etc.), identify the exact model by examining:
       1. SILHOUETTE & SHAPE — tote vs satchel vs barrel vs structured box
       2. HANDLE CONFIGURATION — short handles only / long strap only / both;
          handle drop; how they attach (brass rings, flat sewn, etc.)
       3. OPENING STYLE — open top, zip, flap with turnlock/clasp, drawstring
       4. WIDTH-TO-HEIGHT RATIO and gusset depth
       5. INTERIOR LINING color (e.g., LV Neverfull has beige or red canvas lining)
       6. HARDWARE DETAILS — buckle style, D-ring placement, zipper pull shape,
          engraved logo on clasps
       7. SIZE STAMP — heat stamp or embossed size code visible inside or on vachetta

    B. When similar logo-print materials could be confused between brands
       (e.g., counterfeit or inspired-by patterns), look for:
       1. Precision of logos — authentic LV has perfectly aligned, evenly-spaced
          overlapping "LV", 4-petaled flowers, and 4-pointed stars inside circles
       2. Canvas texture, backing color, and stitch pattern
       3. Hardware engravings and quality
       4. Edge finishing and heat-stamped serial codes

    C. For ALL brands, prioritize distinguishing hardware, label placement,
       stitching color, and any visible serial/date codes over pattern alone.

    After disambiguation, return a JSON object with "is_bag": true plus ALL fields.

    FIELD INSTRUCTIONS:
    - 'brand': Exact brand name as the brand itself writes it (e.g., "Louis Vuitton", "Hermès", "CHANEL").
    - 'model': SHORT common name with size designation (e.g., "Neverfull MM", "Birkin 30",
      "Lady Dior Medium", "Classic Flap Small"). Do NOT include product codes.
    - 'variant': The specific MATERIAL or CANVAS type ONLY — NOT the size or model name.
      Examples: "Monogram Canvas", "Damier Ebene Canvas", "Damier Azur Canvas",
      "Epi Leather", "Togo Leather", "Epsom Leather", "Clemence Leather",
      "Caviar Leather", "Lambskin", "Saffiano Leather", "GG Supreme Canvas",
      "Nylon with Leather Trim". If the material is unknown, use your best estimate.
    - 'category': Bag type (e.g., "Tote Bag", "Shoulder Bag", "Crossbody Bag",
      "Satchel", "Clutch", "Backpack", "Belt Bag").
    - 'dimensions': Official dimensions EXACTLY as documented by the brand on their
      website or catalog. Format: "W × H × D cm (W × H × D in)".
      Use the size that matches the identified model variant (e.g., MM vs GM).
      If you cannot confirm dimensions from official brand sources, omit this field (null).
    - 'priceLow' / 'priceHigh': Current realistic market price range in USD integers.
    - 'confidence': 0–100 integer. Lower it (e.g., 60–75) when material or model
      disambiguation is uncertain; use 85–98 only when confident on all attributes.
    - 'referenceImages': EXACTLY 4 items — "Front view", "Side view", "Back view",
      "Close up". Use placeholder URLs.
    - 'alternativeMatches': 2–3 bags that could plausibly be confused with this one
      (same material, similar silhouette, or same brand). Use placeholder imageUrls.
    - 'sources': 5–6 shopping sources. Include: official brand site, eBay, Amazon,
      Farfetch, Vestiaire Collective, The RealReal. Provide real or structured
      search URLs, realistic listing title, price string, and rating (null for
      official sites).

    JSON structure:
    {
      "is_bag": true,
      "brand": "Brand Name",
      "model": "Short Model Name with size",
      "variant": "Material or Canvas Type",
      "category": "Bag Category",
      "dimensions": "W × H × D cm (W × H × D in)",
      "priceLow": integer,
      "priceHigh": integer,
      "currency": "USD",
      "confidence": integer,
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
        data['variant'] = raw_data.get("variant") or None
        data['category'] = raw_data.get("category") or "Handbag"
        data['dimensions'] = raw_data.get("dimensions") or None
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
            
            alt_brand = alt.get("brand") or "Unknown"
            alt_model_raw = alt.get("model") or "Unknown"
            alt_db_imgs = get_db_product_images(
                alt_brand, _clean_model_for_search(alt_model_raw)
            )
            alt_image_url = (
                alt_db_imgs[0]["image_url"]
                if alt_db_imgs and alt_db_imgs[0].get("image_url")
                else fallback_source_url
            )
            valid_alts.append({
                "id": alt.get("id") or f"a{i}",
                "brand": alt_brand,
                "model": alt_model_raw,
                "confidence": conf,
                "imageUrl": alt_image_url
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

        # --- DB lookup for the identified bag (used for reference images AND source tiles) ---
        model_short = _clean_model_for_search(data["model"])
        db_images = get_db_product_images(data["brand"], model_short)

        # If our own DB has a product photo, use it for all source tiles immediately
        # (zero extra latency — we already made this DB call).
        db_source_image = (
            db_images[0]["image_url"]
            if db_images and db_images[0].get("image_url")
            else None
        )
        if db_source_image:
            for src in valid_sources:
                src["imageUrl"] = db_source_image

        # --- DuckDuckGo image search removed to optimize processing time ---
        # User requested to fix the delay caused by finding images.

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
        variant="Togo Leather",
        category="Tote Bag",
        dimensions="30 × 22 × 16 cm (11.8 × 8.7 × 6.3 in)",
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
