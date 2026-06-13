import os
import uuid
import hashlib
from typing import Optional, Dict, Any, List
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY")
ALLOW_IN_MEMORY_FALLBACK = os.environ.get("ALLOW_IN_MEMORY_FALLBACK", "false").lower() == "true"
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "bag-scanned")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SECRET_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
        print("Supabase client initialized with secret key.")
    except Exception as e:
        print(f"Error initializing Supabase: {e}")
elif not ALLOW_IN_MEMORY_FALLBACK:
    print("Warning: SUPABASE_URL or SUPABASE_SECRET_KEY is missing. Database operations will fail.")

# In-memory fallback (only used if ALLOW_IN_MEMORY_FALLBACK=true and supabase is None)
_mock_scans_db: Dict[str, dict] = {}
_mock_feedback_db: list = []

def get_client() -> Optional[Client]:
    return supabase

def _get_extension(content_type: str, filename: str) -> str:
    if content_type == "image/png":
        return "png"
    elif content_type == "image/webp":
        return "webp"
    elif content_type in ["image/jpeg", "image/jpg"]:
        return "jpg"
    
    parts = filename.split(".")
    if len(parts) > 1:
        return parts[-1]
    return "jpg"

def upload_image(scan_id: str, image_bytes: bytes, filename: str, content_type: str) -> Optional[str]:
    if not supabase:
        if ALLOW_IN_MEMORY_FALLBACK:
            return f"mock_url_for_{scan_id}"
        print("Error: Supabase client not initialized. Cannot upload image.")
        return None
        
    try:
        extension = _get_extension(content_type, filename)
        path = f"scans/{scan_id}/uploaded/original.{extension}"
        
        # Upload to bucket
        res = supabase.storage.from_(STORAGE_BUCKET).upload(
            file=image_bytes,
            path=path,
            file_options={"content-type": content_type}
        )
        
        # We should use create_signed_url instead of get_public_url for private buckets
        # For long-term storage or immediate returning
        signed_url_response = supabase.storage.from_(STORAGE_BUCKET).create_signed_url(path, 3600 * 24 * 7) # 7 days
        return signed_url_response.get("signedURL", None)
    except Exception as e:
        print(f"Error uploading image to Supabase: {e}")
        return None

def generate_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()

def insert_initial_scan(scan_id: str, filename: str, content_type: str, file_size: int, image_hash: str) -> bool:
    if not supabase:
        if ALLOW_IN_MEMORY_FALLBACK:
            _mock_scans_db[scan_id] = {"id": scan_id, "processing_status": "processing"}
            return True
        return False
        
    try:
        extension = _get_extension(content_type, filename)
        path = f"scans/{scan_id}/uploaded/original.{extension}"
        
        data = {
            "id": scan_id,
            "uploaded_image_path": path,
            "original_file_name": filename,
            "mime_type": content_type,
            "file_size_bytes": file_size,
            "image_hash": image_hash,
            "processing_status": "processing"
        }
        supabase.table("scans").insert(data).execute()
        return True
    except Exception as e:
        print(f"Error inserting initial scan: {e}")
        return False

def update_scan_result(scan_id: str, result_data: dict, status: str = "completed", error: str = None) -> bool:
    if not supabase:
        if ALLOW_IN_MEMORY_FALLBACK:
            if scan_id in _mock_scans_db:
                _mock_scans_db[scan_id].update(result_data)
                _mock_scans_db[scan_id]["processing_status"] = status
            return True
        return False

    try:
        update_payload = {
            "processing_status": status,
            "processing_error": error
        }
        if result_data:
            update_payload.update(result_data)
            
        supabase.table("scans").update(update_payload).eq("id", scan_id).execute()
        return True
    except Exception as e:
        print(f"Error updating scan result: {e}")
        return False

def save_scan_candidates(scan_id: str, candidates: list):
    if not supabase:
        return
    try:
        records = []
        for i, cand in enumerate(candidates):
            records.append({
                "scan_id": scan_id,
                "brand": cand.get("brand"),
                "model": cand.get("model"),
                "confidence": cand.get("confidence"),
                "image_url": cand.get("imageUrl"),
                "rank": i + 1
            })
        if records:
            supabase.table("scan_candidates").insert(records).execute()
    except Exception as e:
        print(f"Error saving candidates: {e}")

def save_scan_snapshots(scan_id: str, sources: list):
    if not supabase:
        return
    try:
        records = []
        for src in sources:
            records.append({
                "scan_id": scan_id,
                "source_name": src.get("sourceName"),
                "source_domain": src.get("url", "").split("/")[2] if "//" in src.get("url", "") else None,
                "listing_title": src.get("bagName"),
                "source_url": src.get("url"),
                "image_url": src.get("imageUrl"),
                "price_text": src.get("price"),
                "rating": src.get("rating")
            })
        if records:
            supabase.table("scan_listing_snapshots").insert(records).execute()
    except Exception as e:
        print(f"Error saving source snapshots: {e}")

def save_feedback(feedback_data: dict):
    if not supabase:
        if ALLOW_IN_MEMORY_FALLBACK:
            _mock_feedback_db.append(feedback_data)
        return
    try:
        # Map Next.js payload to DB snake_case columns
        data = {
            "scan_id": feedback_data.get("scanId"),
            "feedback_type": feedback_data.get("type"),
            "correct_brand": feedback_data.get("correctBrand"),
            "correct_model": feedback_data.get("correctModel"),
            "note": feedback_data.get("note"),
        }
        supabase.table("feedback").insert(data).execute()
    except Exception as e:
        print(f"Error saving feedback: {e}")

def get_scan_by_id(scan_id: str) -> Optional[dict]:
    if not supabase:
        if ALLOW_IN_MEMORY_FALLBACK:
            return _mock_scans_db.get(scan_id)
        return None
    try:
        res = supabase.table("scans").select("*").eq("id", scan_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"Error fetching scan: {e}")
        return None

def get_recent_scans(limit: int = 20) -> list:
    if not supabase:
        if ALLOW_IN_MEMORY_FALLBACK:
            return list(_mock_scans_db.values())
        return []
    try:
        res = supabase.table("scans").select("*").order("created_at", desc=True).limit(limit).execute()
        return res.data or []
    except Exception as e:
        print(f"Error fetching recent scans: {e}")
        return []
