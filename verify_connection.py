import os
from dotenv import load_dotenv
from supabase import create_client
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

load_dotenv()

def verify():
    print("Testing Supabase Connection...")
    
    # 1. Test API
    try:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        # Initialize client
        client = create_client(url, key)
        print("✅ Supabase API (Client) initialized")
    except Exception as e:
        print(f"❌ Supabase API failed: {e}")

    # 2. Test Database (SQLAlchemy)
    print("Testing Database Connection...")
    try:
        # Construct URL safely
        # Database URL from environment
        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
             print("❌ DATABASE_URL is not set in environment variables.")
             return
        
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"✅ Database Connection successful: {result.fetchone()}")
    except Exception as e:
        print(f"❌ Database Connection failed: {e}")
        # print(f"debug URL: {db_url}") # Don't print full URL with password in logs if possible, but here we are debugging

if __name__ == "__main__":
    verify()
