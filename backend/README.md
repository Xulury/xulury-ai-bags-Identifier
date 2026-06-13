# LuxeLens Backend

This is the FastAPI backend for the LuxeLens handbag identifier.

## Setup Instructions

1. **Python Environment**
   Ensure you have Python 3.9+ installed.
   Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Supabase Configuration**
   - Create a project on Supabase.
   - Go to `Project Settings` -> `API` and copy the `Project URL` and `service_role` secret.
   - Create a `.env` file in the `backend/` directory by copying `.env.example`:
     ```
     SUPABASE_URL=your-project-url
     SUPABASE_SECRET_KEY=your-service-role-key
     GEMINI_API_KEY=your-gemini-api-key
     STORAGE_BUCKET=bag-scanned
     ```
   - Make sure you also set up the Next.js frontend with its environment variables in `.env.local` at the root of the repo:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
     ```

3. **Storage Bucket**
   - Navigate to the Supabase Storage dashboard.
   - Create a new bucket named `bag-scanned`.
   - Set the bucket to **Private**.
   - Note: Because the backend uses the `service_role` key, it will bypass Storage RLS policies, so you don't need to write complex RLS to allow uploads. We generate signed URLs to allow the frontend to display the uploaded images.

4. **Database Migrations**
   - Execute the SQL found in `backend/migrations/01_initial_schema.sql` via the Supabase SQL Editor.
   - This creates tables for scans, candidates, products, product images, and feedback.

5. **Run the Server**
   ```bash
   python main.py
   ```
   Or use Uvicorn directly:
   ```bash
   uvicorn main:app --reload
   ```

## Confirming Success
- Run the Next.js app on `localhost:3000`.
- Upload an image.
- Check Supabase Storage (`bag-scanned` bucket) -> you should see `scans/<UUID>/uploaded/original.jpg`.
- Check Supabase Database (`scans` table) -> you should see the metadata and Gemini output JSON.

## Import Catalogue Images
Use the provided script to manually add verified brand images to the `product_images` table:
```bash
python scripts/import_product_images.py --product-id <uuid> --source-name "Official Site" --source-url "https://..." --images "url1.jpg" "url2.jpg"
```
