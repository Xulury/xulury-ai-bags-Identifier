import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
load_dotenv(dotenv_path=env_path)

backend_env = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=backend_env, override=True)

from models import BagIdentificationResult, FeedbackPayload
from services.ai_service import identify_bag
from services.db_service import (
    upload_image, generate_image_hash, insert_initial_scan, update_scan_result,
    save_scan_candidates, save_scan_snapshots, save_feedback, get_scan_by_id,
    get_recent_scans, get_client
)

MAX_UPLOAD_SIZE = int(os.environ.get("MAX_UPLOAD_SIZE_MB", 10)) * 1024 * 1024
CORS_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(title="XULURY API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    supabase = get_client()
    status = {"status": "ok", "supabase_configured": supabase is not None}
    if supabase:
        try:
            res = supabase.table("scans").select("id").limit(1).execute()
            status["database_connection"] = "ok"
        except Exception as e:
            status["database_connection"] = f"error: {str(e)}"
    return status

@app.post("/api/v1/identify", response_model=BagIdentificationResult)
async def identify_endpoint(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/") or image.content_type not in ["image/jpeg", "image/png", "image/webp", "image/jpg"]:
        raise HTTPException(status_code=400, detail="File provided is not a supported image.")
    
    try:
        contents = await image.read()
        file_size = len(contents)
        
        if file_size > MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="Image exceeds maximum allowed size.")
        
        scan_id = str(uuid.uuid4())
        image_hash = generate_image_hash(contents)
        db_available = True

        # 1. Insert Initial Scan (non-fatal — AI identification continues even if DB is down)
        success, error_msg = insert_initial_scan(scan_id, image.filename or "uploaded_image", image.content_type, file_size, image_hash)
        if not success:
            db_available = False
            print(f"Warning: Could not initialize scan in database: {error_msg}. Continuing without persistence.")

        # 2. Upload Image (non-fatal)
        image_url = None
        if db_available:
            image_url = upload_image(scan_id, contents, image.filename or "uploaded_image", image.content_type)
            if not image_url:
                print(f"Warning: Image upload to storage failed. Continuing without image URL.")

        # 3. Process AI (always runs — this is the core feature)
        result = identify_bag(scan_id, contents, image.content_type, image_url)

        # 4. Save Candidates, Snapshots and Result (non-fatal)
        if db_available:
            alt_matches = [m.model_dump() for m in result.alternativeMatches]
            sources = [s.model_dump() for s in result.sources]
            save_scan_candidates(scan_id, alt_matches)
            save_scan_snapshots(scan_id, sources)
            update_data = {
                "brand": result.brand,
                "model": result.model,
                "category": result.category,
                "estimated_price_low": result.priceLow,
                "estimated_price_high": result.priceHigh,
                "confidence": result.confidence,
                "currency": result.currency,
                "result_json": result.model_dump(mode='json')
            }
            update_scan_result(scan_id, update_data, status="completed")

        return result
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in identify_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/feedback")
async def feedback_endpoint(payload: FeedbackPayload):
    try:
        save_feedback(payload.model_dump())
        return {"ok": True}
    except Exception as e:
        print(f"Error in feedback_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error saving feedback.")

@app.get("/api/v1/scans")
async def get_scans_history(limit: int = 20):
    return get_recent_scans(limit)

@app.get("/api/v1/scans/{scan_id}")
async def get_single_scan(scan_id: str):
    scan = get_scan_by_id(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    
    return scan.get("result_json") or scan

@app.get("/api/v1/products/{product_id}/images")
async def get_product_images(product_id: str):
    supabase = get_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        res = supabase.table("product_images").select("*").eq("product_id", product_id).eq("is_active", True).order("sort_order").execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/scans/{scan_id}/sources")
async def get_scan_sources(scan_id: str):
    supabase = get_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        res = supabase.table("scan_listing_snapshots").select("*").eq("scan_id", scan_id).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
