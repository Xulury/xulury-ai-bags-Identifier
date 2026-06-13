-- Enable pgcrypto for UUID generation if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create scans table
CREATE TABLE IF NOT EXISTS scans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_image_path text NOT NULL,
    original_file_name text,
    mime_type text,
    file_size_bytes bigint,
    image_hash text,
    brand text,
    model text,
    category text,
    estimated_price_low numeric,
    estimated_price_high numeric,
    currency text DEFAULT 'USD',
    confidence numeric,
    provider_used text,
    model_used text,
    processing_status text,
    processing_error text,
    result_json jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Create scan_candidates table
CREATE TABLE IF NOT EXISTS scan_candidates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id uuid REFERENCES scans(id) ON DELETE CASCADE,
    brand text,
    model text,
    category text,
    confidence numeric,
    rank integer,
    image_url text,
    created_at timestamptz DEFAULT now()
);

-- 3. Create products table
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_brand text,
    canonical_model text,
    category text,
    description text,
    estimated_price_low numeric,
    estimated_price_high numeric,
    currency text DEFAULT 'USD',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    image_url text,
    storage_path text,
    view_type text,
    label text,
    source_name text,
    source_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 5. Create source_listings table
CREATE TABLE IF NOT EXISTS source_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    source_name text,
    source_domain text,
    listing_title text,
    source_url text,
    image_url text,
    price_text text,
    price_low numeric,
    price_high numeric,
    currency text,
    rating numeric,
    rating_count integer,
    availability_status text,
    is_verified boolean DEFAULT false,
    last_checked_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. Create scan_listing_snapshots table
CREATE TABLE IF NOT EXISTS scan_listing_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id uuid REFERENCES scans(id) ON DELETE CASCADE,
    listing_id uuid REFERENCES source_listings(id) ON DELETE SET NULL,
    source_name text,
    source_domain text,
    listing_title text,
    source_url text,
    image_url text,
    price_text text,
    rating numeric,
    availability_status text,
    created_at timestamptz DEFAULT now()
);

-- 7. Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id uuid REFERENCES scans(id) ON DELETE CASCADE,
    feedback_type text,
    correct_brand text,
    correct_model text,
    note text,
    created_at timestamptz DEFAULT now()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_scans_image_hash ON scans(image_hash);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_source_listings_product_id ON source_listings(product_id);
CREATE INDEX IF NOT EXISTS idx_scan_listing_snapshots_scan_id ON scan_listing_snapshots(scan_id);
CREATE INDEX IF NOT EXISTS idx_feedback_scan_id ON feedback(scan_id);
