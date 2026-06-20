import os
import re
import json
from datetime import datetime

from google import genai
from google.genai import types
from models import BagIdentificationResult, ShoppingSource

def _load_client() -> "genai.Client | None":
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local')
    load_dotenv(dotenv_path=env_path, override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    # Hard timeout on every Gemini call so a network hiccup can never leave a
    # request hanging indefinitely.
    return genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=60_000))


def _strip_json_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _coerce_int(val, default=0):
    if isinstance(val, str):
        return int(re.sub(r'[^\d]', '', val) or default)
    if val is None:
        return default
    try:
        return int(val)
    except Exception:
        return default


CORE_PROMPT = """
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
  "confidence": integer
}
"""

EXTRAS_PROMPT_TEMPLATE = """
You are a luxury handbag market researcher. For the following identified bag:

Brand: {brand}
Model: {model}
Material/variant: {variant}
Category: {category}

Provide:
1. 'alternativeMatches': 2–3 OTHER bags that could plausibly be confused with this
   one (same material, similar silhouette, or same brand).
2. 'sources': 5–6 shopping sources for this exact bag. Include: official brand
   site, eBay, Amazon, Farfetch, Vestiaire Collective, The RealReal. Provide
   real or structured search URLs, a realistic listing title, a price string,
   and a rating (null for official sites).

Return ONLY this JSON structure (nothing else):
{{
  "alternativeMatches": [
    {{ "id": "a1", "brand": "Brand", "model": "Model", "confidence": 80 }}
  ],
  "sources": [
    {{
      "sourceName": "Official Site",
      "brand": "{brand}",
      "bagName": "Listing title",
      "price": "$1,690",
      "rating": null,
      "url": "https://example.com/product"
    }}
  ]
}}
"""


def identify_bag_core(scan_id: str, image_bytes: bytes, mime_type: str, uploaded_image_url: str = None) -> BagIdentificationResult:
    """Fast call: brand/model/variant/category/dimensions/price only.
    alternativeMatches and sources are left empty — identify_bag_extras fills
    those in afterwards so the result page can render the moment this returns."""
    client = _load_client()
    if not client:
        print("Warning: GEMINI_API_KEY not set. Using mock response.")
        return _mock_response(scan_id)

    try:
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                CORE_PROMPT,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        try:
            raw_data = json.loads(_strip_json_fence(response.text))
        except Exception:
            raw_data = {}

        if raw_data.get("is_bag") is False:
            from fastapi import HTTPException
            reason = raw_data.get("not_bag_reason") or "This doesn't appear to be a handbag."
            raise HTTPException(status_code=400, detail=reason)

        data = {
            'id': scan_id,
            'createdAt': datetime.utcnow().isoformat() + "Z",
            'brand': raw_data.get("brand") or "Unknown Brand",
            'model': raw_data.get("model") or "Unknown Model",
            'variant': raw_data.get("variant") or None,
            'category': raw_data.get("category") or "Handbag",
            'dimensions': raw_data.get("dimensions") or None,
            'currency': raw_data.get("currency") or "USD",
            'alternativeMatches': [],
            'sources': [],
            'uploadedImage': uploaded_image_url,
            'extrasReady': False,
        }
        for key in ["priceLow", "priceHigh", "confidence"]:
            data[key] = _coerce_int(raw_data.get(key))

        return BagIdentificationResult(**data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error calling Gemini API (core): {e}")
        return _mock_response(scan_id)


def identify_bag_extras(brand: str, model: str, variant: str, category: str) -> dict:
    """Slower-to-compute but cheap text-only call: alternative matches +
    shopping sources. No image involved, so it's quick on its own — it just
    runs after the core call instead of inside it."""
    client = _load_client()
    if not client:
        return {"alternativeMatches": [], "sources": []}

    prompt = EXTRAS_PROMPT_TEMPLATE.format(
        brand=brand, model=model, variant=variant or "Unknown", category=category
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        try:
            raw_data = json.loads(_strip_json_fence(response.text))
        except Exception:
            raw_data = {}

        alt_matches = raw_data.get("alternativeMatches", [])
        if not isinstance(alt_matches, list):
            alt_matches = []
        valid_alts = []
        for i, alt in enumerate(alt_matches):
            if not isinstance(alt, dict):
                continue
            valid_alts.append({
                "id": alt.get("id") or f"a{i}",
                "brand": alt.get("brand") or "Unknown",
                "model": alt.get("model") or "Unknown",
                "confidence": _coerce_int(alt.get("confidence"), 80),
            })

        sources = raw_data.get("sources", [])
        if not isinstance(sources, list):
            sources = []
        valid_sources = []
        for src in sources:
            if not isinstance(src, dict):
                continue
            valid_sources.append({
                "sourceName": src.get("sourceName") or "Web",
                "brand": src.get("brand") or brand,
                "bagName": src.get("bagName") or model,
                "price": str(src.get("price") or ""),
                "rating": src.get("rating") if isinstance(src.get("rating"), (int, float)) else None,
                "url": src.get("url") or "#",
                "imageUrl": "",
            })

        return {"alternativeMatches": valid_alts, "sources": valid_sources}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error calling Gemini API (extras): {e}")
        return {"alternativeMatches": [], "sources": []}


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
        alternativeMatches=[
            {"id": "a1", "brand": "Hermès", "model": "Kelly 28", "confidence": 75}
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
        createdAt=datetime.utcnow().isoformat() + "Z",
        extrasReady=True,
    )
