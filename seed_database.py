import os
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# --- CONFIGURATION ---
# We use the DIRECT database URL to bypass Row Level Security (RLS) issues
# that might block the API client.
DB_PASSWORD = "Kozhikodereconnect123"
encoded_password = quote_plus(DB_PASSWORD)
DATABASE_URL = f"postgresql://postgres:{encoded_password}@db.miivxtkieuciwxweblda.supabase.co:5432/postgres"

print(f"Connecting to: {DATABASE_URL.replace(encoded_password, '******')}")

try:
    engine = create_engine(DATABASE_URL)
    connection = engine.connect()
    print("✅ Successfully connected to Supabase PostgreSQL Database!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

# --- DATA TO INSERT ---
# Create a dummy vendor first (to satisfy Foreign Key info)
VENDOR_SQL = """
INSERT INTO users (supabase_id, email, name, role) 
VALUES ('seed-user-001', 'demo_vendor@example.com', 'Demo Vendor', 'vendor')
ON CONFLICT (supabase_id) DO NOTHING;

INSERT INTO vendors (user_id, supabase_id, business_name, email)
SELECT id, supabase_id, 'Demo Store', email FROM users WHERE supabase_id = 'seed-user-001'
ON CONFLICT (supabase_id) DO NOTHING;
"""

# Products
PRODUCTS = [
    {"id": "k1", "name": "Kozhikode Halwa (Black)", "description": "Authentic black sticky halwa made with jaggery and coconut oil.", "price": 250, "size": "1kg", "seller_location": "SM Street", "stock": 50},
    {"id": "k2", "name": "Banana Chips", "description": "Crispy Nendran banana chips fried in pure coconut oil.", "price": 180, "size": "500g", "seller_location": "Palayam", "stock": 100},
    {"id": "k3", "name": "Jackfruit Chips", "description": "Crunchy Chakka Varuthathu.", "price": 220, "size": "250g", "seller_location": "Kuttichira", "stock": 30},
    {"id": "k4", "name": "Rosewood Elephant Model", "description": "Handcarved rosewood elephant souvenir.", "price": 1200, "size": "Medium", "seller_location": "Arts Village", "stock": 5},
    {"id": "k5", "name": "Handmade Embroidery Saree", "description": "Cotton saree with traditional embroidery work.", "price": 2500, "size": "Free Size", "seller_location": "Civil Lines", "stock": 10},
]

def seed():
    try:
        # 1. Create Vendor
        print("🌱 Seeding Vendor...")
        connection.execute(text(VENDOR_SQL))
        connection.commit()
        
        # Get Vendor ID
        result = connection.execute(text("SELECT id FROM vendors WHERE email = 'demo_vendor@example.com'"))
        vendor_id = result.fetchone()[0]
        print(f"   Using Vendor ID: {vendor_id}")

        # 2. Insert Products
        print("🌱 Seeding Products...")
        for p in PRODUCTS:
            # Check if exists
            exists = connection.execute(text(f"SELECT 1 FROM products WHERE id = '{p['id']}'")).fetchone()
            if not exists:
                sql = text("""
                    INSERT INTO products (id, vendor_id, name, description, price, size, seller_location, stock, created_at)
                    VALUES (:id, :vendor_id, :name, :description, :price, :size, :seller_location, :stock, NOW())
                """)
                connection.execute(sql, {"id": p['id'], "vendor_id": vendor_id, **p})
                print(f"   Added: {p['name']}")
            else:
                print(f"   Skipped (already exists): {p['name']}")
        
        connection.commit()
        print("✅ Database seeding complete!")
        print("   Go to https://ecommerce-fullstack-ve72.onrender.com to see your data live.")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        connection.rollback()
    finally:
        connection.close()

if __name__ == "__main__":
    seed()
