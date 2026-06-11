import os
import uuid
from typing import Optional
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized.")
    except Exception as e:
        print(f"Error initializing Supabase: {e}")

# In-memory fallback
_mock_scans_db = {}
_mock_feedback_db = []

def upload_image(image_bytes: bytes, filename: str, content_type: str) -> Optional[str]:
    if not supabase:
        return None
    try:
        # Upload to bag-scanned bucket
        path = f"scans/{uuid.uuid4()}_{filename}"
        res = supabase.storage.from_("bag-scanned").upload(
            file=image_bytes,
            path=path,
            file_options={"content-type": content_type}
        )
        # Get public url
        public_url = supabase.storage.from_("bag-scanned").get_public_url(path)
        return public_url
    except Exception as e:
        print(f"Error uploading image to Supabase: {e}")
        return None

def save_scan(scan_data: dict):
    if supabase:
        try:
            supabase.table("scans").insert(scan_data).execute()
        except Exception as e:
            print(f"Error saving scan to Supabase: {e}")
            _mock_scans_db[scan_data.get('id')] = scan_data
    else:
        _mock_scans_db[scan_data.get('id')] = scan_data

def save_feedback(feedback_data: dict):
    if supabase:
        try:
            supabase.table("feedback").insert(feedback_data).execute()
        except Exception as e:
            print(f"Error saving feedback to Supabase: {e}")
            _mock_feedback_db.append(feedback_data)
    else:
        _mock_feedback_db.append(feedback_data)
