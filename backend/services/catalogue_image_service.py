from typing import List, Optional
from services.db_service import get_client

def import_product_images(product_id: str, source_name: str, source_url: str, image_urls: List[str], labels: List[str] = None, dry_run: bool = False) -> List[dict]:
    """
    Import and deduplicate product images to the product_images table.
    Ensures that empty image records are never created.
    """
    supabase = get_client()
    if not supabase and not dry_run:
        print("Error: Supabase client not initialized.")
        return []

    # Clean and deduplicate URLs
    valid_urls = []
    seen = set()
    for url in image_urls:
        clean_url = url.strip()
        if clean_url and clean_url not in seen:
            seen.add(clean_url)
            valid_urls.append(clean_url)

    if not valid_urls:
        print("No valid image URLs provided.")
        return []

    records = []
    for i, url in enumerate(valid_urls):
        label = labels[i] if labels and i < len(labels) else None
        # Infer some label if missing
        if not label:
            if "front" in url.lower(): label = "Front view"
            elif "side" in url.lower(): label = "Side view"
            elif "back" in url.lower(): label = "Back view"
            elif "detail" in url.lower() or "close" in url.lower(): label = "Close up"
            elif "interior" in url.lower(): label = "Interior"
            elif "logo" in url.lower() or "hardware" in url.lower(): label = "Hardware"
            else: label = "General"

        record = {
            "product_id": product_id,
            "image_url": url,
            "view_type": label,
            "label": label,
            "source_name": source_name,
            "source_url": source_url,
            "sort_order": i
        }
        records.append(record)

    if dry_run:
        print(f"Dry run: Would insert {len(records)} images for product {product_id}")
        return records

    try:
        res = supabase.table("product_images").insert(records).execute()
        print(f"Successfully inserted {len(records)} images.")
        return res.data or []
    except Exception as e:
        print(f"Error inserting product images: {e}")
        return []
