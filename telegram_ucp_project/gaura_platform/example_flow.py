import asyncio
import base64
import os
from gaura_platform.mobile_stub.node import MobileNode
from gaura_platform.config.schema import PlatformItem

async def demonstrate_gaura_ecosystem():
    """
    Simulates the core flow:
    1. Seller Phone performs AI compute locally.
    2. Hub indexes the metadata.
    3. Hub relays a detail request back to the phone.
    """
    GEMINI_KEY = os.getenv("GEMINI_API_KEY", "MOCK_KEY")
    
    print("\n--- [START] Gaura Platform Flow ---")
    
    # 1. Setup Seller's Phone (Mobile Node)
    seller_node = MobileNode(
        node_id="seller_iphone_99", 
        db_path="seller_vault.db", 
        gemini_key=GEMINI_KEY
    )
    print("✅ Seller's Mobile Node Initialized (Local SQLite Created)")

    # 2. Simulate Seller Uploading a Product Photo
    # For simulation, we use a tiny blank base64 instead of a real image
    mock_image = base64.b64encode(b"fake_image_bytes").decode()
    
    print("\n[Seller] Uploading 'Grocery Item' photo...")
    print("[Seller] Executing Edge Compute (AI Spec Generation)...")
    
    # In a real run without a key, this would fail, so we'll wrap it or mock
    try:
        metadata = await seller_node.process_seller_upload(
            name="Organic Almond Milk",
            category="Grocery",
            price=4.99,
            image_data=mock_image
        )
        print(f"✅ AI Spec Generation Complete! Metadata ready for Hub: {metadata}")
    except Exception as e:
        print(f"⚠️ AI Compute Skipped (Missing Key/Network). Using mock metadata. Error: {e}")
        metadata = {"id": "prod_1", "name": "Organic Almond Milk", "category": "Grocery", "price": 4.99, "node_id": "seller_iphone_99"}

    # 3. Simulate The 'Middleman' (Hub) Indexing
    print("\n[Hub] Indexing product metadata (Google Search style)...")
    index_item = PlatformItem(
        id=metadata['id'],
        vendor_id=metadata['node_id'],
        name=metadata['name'],
        category=metadata['category'],
        base_price=metadata['price'],
        node_id=metadata['node_id'] # Note: Added to schema if missing
    )
    print(f"✅ Hub Search Index updated for: {index_item.name}")

    # 4. Simulate a Buyer Requesting Details (The Relay)
    print("\n[Buyer Bot] Requesting FULL specifications for Almond Milk...")
    print("[Hub] Finding node... Relaying request to 'seller_iphone_99'...")
    
    # Hub fetches from the phone (simulated direct call)
    full_specs = seller_node.get_product_details(metadata['id'])
    
    print("\n--- [RESULT] RELAYED DATA FROM SELLER'S PHONE ---")
    print(f"Product: {full_specs['name']}")
    print(f"Storage: Data retrieved from local phone vault: {metadata['node_id']}")
    print(f"AI Specs: {full_specs['specs']}")
    print("--------------------------------------------------")

if __name__ == "__main__":
    asyncio.run(demonstrate_gaura_ecosystem())
