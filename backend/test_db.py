import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
load_dotenv(dotenv_path=env_path)

backend_env = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=backend_env, override=True)

from services.db_service import insert_initial_scan
import uuid

scan_id = str(uuid.uuid4())
try:
    success = insert_initial_scan(scan_id, "test.jpg", "image/jpeg", 1024, "fakehash")
    print("Success:", success)
except Exception as e:
    print("Exception details:", repr(e))
