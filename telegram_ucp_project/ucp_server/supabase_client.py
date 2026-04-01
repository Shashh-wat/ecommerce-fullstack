from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("SUPABASE_URL", "https://miivxtkieuciwxweblda.supabase.co")
KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paXZ4dGtpZXVjaXd4d2VibGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzE4NzYsImV4cCI6MjA3ODgwNzg3Nn0.VNWaZlwgvCmhiL2MwxLgqI4_YkDslc0FsKmZwBuZVDA")

try:
    supabase: Client = create_client(URL, KEY)
except Exception as e:
    print(f"Supabase Connection Failed: {e}")
    supabase = None
