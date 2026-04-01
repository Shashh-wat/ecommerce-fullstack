import os
import sys
import uvicorn
import base64
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import httpx

# Add parent dir to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from gaura_platform.mobile_stub.node import MobileNode
from gaura_platform.config.schema import PlatformItem, UserAuthRequest

from fastapi.middleware.cors import CORSMiddleware
import asyncio, urllib.parse, time

app = FastAPI(title="Gaura AI Mobile App Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Local Node (The Phone's Logic)
NODE_ID = os.getenv("NODE_ID", "local_phone_user")
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "MOCK_KEY")
HUB_URL = os.getenv("HUB_URL", "http://localhost:8200")
HF_TOKEN = os.getenv("HF_TOKEN", "")

node = MobileNode(NODE_ID, f"{NODE_ID}_vault.db", GEMINI_KEY)

# Output dir for generated ad images
AD_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "ad_images")
os.makedirs(AD_OUTPUT_DIR, exist_ok=True)

# Serve compiled React assets
try:
    app.mount("/assets", StaticFiles(directory="gaura_platform/gaura_mobile_react/dist/assets"), name="assets")
except Exception:
    pass

# Mount Local Image Vault
os.makedirs("gaura_platform/mobile_stub/local_vault/images", exist_ok=True)
try:
    app.mount("/product_images", StaticFiles(directory="gaura_platform/mobile_stub/local_vault/images"), name="product_images")
except Exception:
    pass

# Mount generated ad images
try:
    app.mount("/ad_images", StaticFiles(directory=AD_OUTPUT_DIR), name="ad_images")
except Exception:
    pass

@app.get("/", response_class=HTMLResponse)
async def get_app():
    with open("gaura_platform/gaura_mobile_react/dist/index.html", "r") as f:
        return f.read()

# --- AUTH API ---
@app.post("/api/signup")
async def signup(req: UserAuthRequest):
    async with httpx.AsyncClient() as client:
        print(f"📲 [App] Forwarding signup for {req.email}")
        response = await client.post(f"{HUB_URL}/signup", json=req.model_dump())
        res_data = response.json()
        print(f"📲 [App] Hub Response: {res_data}")
        if res_data.get("status") == "success":
            # Link current node to this user
            await client.post(f"{HUB_URL}/link_node", params={"user_id": res_data["user_id"], "node_id": NODE_ID})
        return res_data

@app.post("/api/login")
async def login(req: UserAuthRequest):
    async with httpx.AsyncClient() as client:
        print(f"📲 [App] Forwarding login for {req.email}")
        response = await client.post(f"{HUB_URL}/login", json=req.model_dump())
        res_data = response.json()
        print(f"📲 [App] Hub Response: {res_data}")
        if res_data.get("status") == "success":
            # Link current node to this user
            await client.post(f"{HUB_URL}/link_node", params={"user_id": res_data["user"]["id"], "node_id": NODE_ID})
        return res_data

@app.post("/api/auto_create_bot")
async def auto_create_bot(user_id: str, bot_name: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{HUB_URL}/auto_create_bot", params={"user_id": user_id, "bot_name": bot_name})
        return response.json()

@app.post("/api/confirm_upi_payment")
async def approve_payment(order_id: str, vendor_node_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{HUB_URL}/confirm_upi_payment", params={"order_id": order_id, "vendor_node_id": vendor_node_id})
        return response.json()

# --- IMAGE GENERATION HELPER ---
async def generate_ad_images_hf(product_name: str, product_id: str) -> list:
    """Generate 3 ad images using HF FLUX.1-schnell"""
    if not HF_TOKEN:
        return []
    url = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
    headers = {"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"}
    prompts = [
        f"professional studio product photography of {product_name}, white background, sharp focus, 4K commercial",
        f"lifestyle photo of {product_name} in everyday use, natural lighting, warm tones, Instagram style",
        f"minimalist flat lay of {product_name}, overhead view, clean white background, editorial style",
    ]
    styles = ["studio", "lifestyle", "flatlay"]
    saved = []
    async with httpx.AsyncClient(timeout=120) as client:
        for prompt, style in zip(prompts, styles):
            try:
                resp = await client.post(url, headers=headers, json={"inputs": prompt})
                if resp.status_code == 200 and "image" in resp.headers.get("content-type", ""):
                    fname = f"{product_id}_{style}.jpg"
                    fpath = os.path.join(AD_OUTPUT_DIR, fname)
                    with open(fpath, "wb") as f:
                        f.write(resp.content)
                    saved.append(f"/ad_images/{fname}")
                    await asyncio.sleep(1)
            except Exception as e:
                print(f"⚠️ Image gen error ({style}): {e}")
    return saved

# --- SELLER API ---
@app.post("/api/upload_product")
async def upload_product(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(...)
):
    """Seller UI calls this to start the Edge-AI loop + generate ad images"""
    print(f"📥 [App] Received upload request: {name}, {category}, {price}")
    contents = await image.read()
    image_b64 = base64.b64encode(contents).decode()
    
    # 1. Execute Edge Compute (AI Spec Gen + Local Storage)
    metadata = await node.process_seller_upload(name, category, price, image_b64)
    product_id = metadata['id']
    
    # 2. Generate Ad Images via HF FLUX (runs in background-ish)
    print(f"🎨 [App] Generating ad images for {name}...")
    ad_image_urls = await generate_ad_images_hf(name, product_id)
    print(f"✅ [App] Generated {len(ad_image_urls)} ad images")
    
    # 3. Inform the Hub
    async with httpx.AsyncClient() as client:
        try:
            item = PlatformItem(
                id=product_id,
                vendor_id=NODE_ID,
                node_id=NODE_ID,
                name=name,
                category=category,
                base_price=price,
                ai_generated_image_url=ad_image_urls[0] if ad_image_urls else metadata.get('ai_generated_image_url')
            )
            await client.post(f"{HUB_URL}/publish_metadata", json=item.dict())
        except Exception as e:
            print(f"⚠️ Could not sync with Hub: {e}")
            
    return {
        "status": "success",
        "product_id": product_id,
        "ad_images": ad_image_urls,
        "specs": metadata.get("specs", {})
    }

# --- BUYER API ---
@app.get("/api/market_search")
async def market_search(q: str):
    """Buyer UI calls this to search the Unified Backend (Shopify + Hub)"""
    UCP_SERVER_URL = os.getenv("UCP_SERVER_URL", "http://localhost:8182")
    async with httpx.AsyncClient() as client:
        try:
            # Query Unified Backend which now aggregates everything
            response = await client.get(f"{UCP_SERVER_URL}/products", params={"q": q})
            data = response.json()
            items = data.get("items", [])
            
            # Map Unified format back to what the Mobile UI expects if necessary
            # The Mobile UI expects: id, node_id, name, price, etc.
            normalized = []
            for item in items:
                # If it's a gaura product, extract the node_id
                if item["id"].startswith("gaura::"):
                    parts = item["id"].split("::")
                    normalized.append({
                        "id": parts[2],
                        "node_id": parts[1],
                        "name": item["name"].replace("📦 ", ""),
                        "base_price": item["price"],
                        "category": "Gaura Node",
                        "source": "gaura"
                    })
                else:
                    normalized.append({
                        "id": item["id"],
                        "node_id": "shopify",
                        "name": item["name"],
                        "base_price": item["price"],
                        "category": "Shopify",
                        "source": "shopify"
                    })
            return normalized
        except Exception as e:
            print(f"Mobile search bridge error: {e}")
            return []

@app.get("/api/product_details/{node_id}/{product_id}")
async def get_details(node_id: str, product_id: str):
    """Buyer UI calls this to RELAY a detail request via the Hub"""
    # If it's our own node, we just read local
    if node_id == NODE_ID:
        return node.get_product_details(product_id)
        
    # Otherwise, ask the Hub to relay to the owner's phone
    async with httpx.AsyncClient() as client:
        payload = {
            "target_node_id": node_id,
            "action": "get_tech_report",
            "payload": {"product_id": product_id}
        }
        response = await client.post(f"{HUB_URL}/relay_request", json=payload)
        return response.json()

@app.get("/api/my_sales")
async def my_sales():
    """Seller UI calls this to see incoming orders from their phone"""
    async with httpx.AsyncClient() as client:
        # Ask our local node service for orders
        payload = {"action": "list_orders", "payload": {}}
        # Node service usually on 9001 (or local env)
        node_url = os.getenv("NODE_SERVICE_URL", "http://localhost:9001")
        try:
            response = await client.post(f"{node_url}/execute", json=payload)
            return response.json()
        except:
            return {"status": "error", "data": []}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8500))
    uvicorn.run(app, host="0.0.0.0", port=port)
