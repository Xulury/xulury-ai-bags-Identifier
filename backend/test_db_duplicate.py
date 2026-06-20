import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
load_dotenv(dotenv_path=env_path)
backend_env = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=backend_env, override=True)

from services.db_service import insert_initial_scan
import uuid

scan_id1 = str(uuid.uuid4())
scan_id2 = str(uuid.uuid4())
try:
    print("Insert 1:", insert_initial_scan(scan_id1, "test.jpg", "image/jpeg", 1024, "same_hash"))
    print("Insert 2:", insert_initial_scan(scan_id2, "test.jpg", "image/jpeg", 1024, "same_hash"))
except Exception as e:
    print("Exception details:", repr(e))
