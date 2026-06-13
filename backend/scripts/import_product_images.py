import os
import sys
import argparse

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.catalogue_image_service import import_product_images

def main():
    parser = argparse.ArgumentParser(description="Import product catalogue images to Supabase.")
    parser.add_argument("--product-id", required=True, help="UUID of the product")
    parser.add_argument("--source-name", required=True, help="Name of the source (e.g. 'Official Site', 'Farfetch')")
    parser.add_argument("--source-url", required=True, help="URL of the product page")
    parser.add_argument("--images", nargs='+', required=True, help="List of image URLs to import")
    parser.add_argument("--labels", nargs='*', help="Optional explicit labels matching the image URLs")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without inserting")
    
    args = parser.parse_args()
    
    if args.labels and len(args.labels) != len(args.images):
        print("Warning: Number of labels provided does not match number of images.")
        
    print(f"Starting import for product {args.product_id} from {args.source_name}")
    import_product_images(
        product_id=args.product_id,
        source_name=args.source_name,
        source_url=args.source_url,
        image_urls=args.images,
        labels=args.labels,
        dry_run=args.dry_run
    )

if __name__ == "__main__":
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    load_dotenv(dotenv_path=env_path)
    main()
