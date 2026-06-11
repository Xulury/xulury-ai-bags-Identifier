from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models import BagIdentificationResult, FeedbackPayload
from services.ai_service import identify_bag
from services.db_service import save_scan, save_feedback, upload_image

app = FastAPI(title="LuxeLens API", version="1.0.0")

# Add CORS middleware to allow Next.js frontend to communicate if not using rewrites
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/identify", response_model=BagIdentificationResult)
async def identify_endpoint(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    try:
        contents = await image.read()
        
        # Upload image to Supabase Storage
        image_url = upload_image(contents, image.filename or "uploaded_image", image.content_type)

        # Call AI Service
        result = identify_bag(contents, image.content_type)
        
        # Set the uploadedImage URL to the Supabase URL if successful
        if image_url:
            result.uploadedImage = image_url
        
        # Save to DB
        save_scan(result.model_dump())
        
        return result
        
    except Exception as e:
        print(f"Error in identify_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during identification.")

@app.post("/api/v1/feedback")
async def feedback_endpoint(payload: FeedbackPayload):
    try:
        save_feedback(payload.model_dump())
        return {"ok": True}
    except Exception as e:
        print(f"Error in feedback_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error saving feedback.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
