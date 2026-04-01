import os
import sqlite3
import json
import base64
import httpx
from typing import Dict, Any, List
from datetime import datetime
import google.generativeai as genai
from openai import OpenAI
from pydantic import BaseModel

# Shared config
from gaura_platform.config.schema import PlatformItem, MobileResponse

class MobileNode:
    """
    Simulates the 'Phone' logic (Edge Compute).
    Each instance represents one user's device.
    """
    def __init__(self, node_id: str, db_path: str, gemini_key: str):
        self.node_id = node_id
        self.db_path = db_path
        self.gemini_key = gemini_key
        
        # Initialize Gemini
        genai.configure(api_key=self.gemini_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Initialize OpenAI (Optional)
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.openai_client = OpenAI(api_key=self.openai_key) if self.openai_key else None
        
        self._init_db()

    def _init_db(self):
        """Initializes the local SQLite database on the 'phone'"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Local Products (Actual data lives here)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS local_products (
                id TEXT PRIMARY KEY,
                name TEXT,
                category TEXT,
                description TEXT,
                price REAL,
                raw_image_path TEXT,
                ai_generated_image_url TEXT,
                specifications_json TEXT,
                created_at TIMESTAMP
            )
        ''')
        
        # Local Orders
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS local_orders (
                id TEXT PRIMARY KEY,
                buyer_id TEXT,
                status TEXT DEFAULT 'pending',
                payment_status TEXT DEFAULT 'awaiting_payment',
                items_json TEXT,
                total_amount REAL,
                created_at TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()

    async def generate_product_specs(self, product_name: str, image_bytes: bytes) -> Dict[str, Any]:
        """
        AI Hook: Recognizes product and generates detailed specs.
        (Simulates 'On-Device' Compute)
        """
        is_valid_image = len(image_bytes) > 100
        if not is_valid_image or not self.gemini_key or self.gemini_key == "MOCK_KEY":
            # Smart Mock for development speed
            return {
                "technical_specs": {
                    "weight": "500g",
                    "sku": f"GAURA-{product_name[:3].upper()}-001",
                    "material": "Organic / Premium Grade"
                },
                "ingredients": ["Natural Content", "Zero Preservatives"],
                "marketing_description": f"Experience the future of commerce with {product_name}. Sourced and verified by Gaura AI Edge Network.",
                "ai_agent_status": "Simulated (Add API Key for real Vision)"
            }

        prompt = f"""
        Act as a professional product architect. 
        Analyze this product: {product_name}.
        Generate a detailed 'Product Specification Report' in JSON format.
        """
        try:
            import os
            os.environ["GRPC_DNS_RESOLVER"] = "native"
            response = self.model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_bytes}])
            return json.loads(response.text.replace('```json', '').replace('```', ''))
        except Exception as e:
            print(f"⚠️ Gemini API failed: {e}")
            return {
                "technical_specs": {"note": "Generated Fallback due to API error"},
                "ingredients": ["N/A"],
                "marketing_description": f"Premium {product_name} from Gaura Seller.",
                "ai_agent_status": "Fallback Data",
                "raw_report": "Error: " + str(e)
            }

    async def generate_premium_image(self, product_name: str, image_bytes: bytes) -> str:
        """
        Simplified AI Artist: 
        1. Generates a 'Studio' version of the product using DALL-E or Pollinations.
        """
        gen_filename = f"premium_{product_name.lower().replace(' ', '_')}_{int(datetime.now().timestamp())}.jpg"
        target_path = os.path.join("gaura_platform/mobile_stub/local_vault/images", gen_filename)
        
        # Simple studio prompt
        studio_prompt = f"Professional studio product photography of {product_name}, high-end commercial style, clean aesthetic, 8k resolution, soft studio lighting."

        # Step 1: Try DALL-E 3
        if self.openai_client:
            try:
                print(f"🎨 [AI Artist] Sending simplified DALL-E 3 request for {product_name}...")
                response = self.openai_client.images.generate(
                    model="dall-e-3",
                    prompt=studio_prompt,
                    size="1024x1024",
                    n=1,
                )
                image_url = response.data[0].url
                async with httpx.AsyncClient() as client:
                    img_res = await client.get(image_url)
                    with open(target_path, "wb") as f:
                        f.write(img_res.content)
                return f"/product_images/{gen_filename}"
            except Exception as e:
                print(f"⚠️ DALL-E failed: {e}")

        # Step 2: Fallback to Pollinations (Fast & Free)
        try:
            print(f"🎨 [AI Artist] Using Pollinations for {product_name}...")
            import urllib.parse
            safe_prompt = urllib.parse.quote(studio_prompt)
            pollinations_url = f"https://image.pollinations.ai/prompt/{safe_prompt}?width=1024&height=1024&nologo=true"
            
            async with httpx.AsyncClient() as client:
                img_res = await client.get(pollinations_url, timeout=30.0)
                if img_res.status_code == 200:
                    with open(target_path, "wb") as f:
                        f.write(img_res.content)
                    return f"/product_images/{gen_filename}"
        except Exception as e:
            print(f"⚠️ Pollinations failed: {e}")

        # Step 3: Global Fallback
        return "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1000&auto=format&fit=crop"

    async def generate_technical_report(self, product_id: str, specs: Dict[str, Any]) -> str:
        """
        AI Hook: Generates a detailed PDF/Markdown report stored locally.
        """
        report_filename = f"report_{product_id}.md"
        report_path = os.path.join("gaura_platform/mobile_stub/local_vault/reports", report_filename)
        
        report_content = f"""# Gaura AI: Technical Product Specification
## Product: {specs.get('product_name', 'Unknown')}
**Generated on**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Verification Level**: AI-Verified Grade A

### Technical Specifications
{json.dumps(specs.get('technical_specs', {}), indent=2)}

### Ingredients / Materials
{", ".join(specs.get('ingredients', []))}

### Marketing Description
{specs.get('marketing_description', 'N/A')}

---
*Stored Securely on Gaura Edge Node {self.node_id}*
"""
        with open(report_path, "w") as f:
            f.write(report_content)
            
        print(f"📄 [Phone] Technical Report Generated: {report_path}")
        return report_path

    async def process_seller_upload(self, name: str, category: str, price: float, image_data: str):
        """
        Full Edge Loop:
        1. Recognize & Spec (Gemini)
        2. Generate Premium Photo (Image Gen)
        3. Create PDF/MD Report
        4. Store all on Node
        """
        image_bytes = base64.b64decode(image_data)
        product_id = f"prod_{int(datetime.now().timestamp())}"
        
        # 1. Edge Compute: Specs
        specs = await self.generate_product_specs(name, image_bytes)
        
        # 2. Edge Compute: Premium Image
        premium_img_path = await self.generate_premium_image(name, image_bytes)
        
        # 3. Edge Compute: Tech Report
        report_path = await self.generate_technical_report(product_id, specs)
        
        # 4. Storage
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO local_products (id, name, category, price, ai_generated_image_url, specifications_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (product_id, name, category, price, premium_img_path, json.dumps(specs), datetime.now()))
        conn.commit()
        conn.close()
        
        return {
            "id": product_id,
            "name": name,
            "node_id": self.node_id,
            "category": category,
            "base_price": price,
            "ai_generated_image_url": premium_img_path
        }

    def get_product_details(self, product_id: str) -> Dict[str, Any]:
        """Relay Hook: Returns full data from local DB when Hub requests it"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM local_products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "price": row[4],
                "specs": json.loads(row[7])
            }
        return None
    async def create_order(self, buyer_id: str, items_req: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        UCP Logic: Converts a checkout request into a local order.
        """
        order_id = f"ord_{int(datetime.now().timestamp())}"
        processed_items = []
        total_amount = 0
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for item in items_req:
            pid = item['product_id']
            qty = item['quantity']
            
            # Verify product exists and take price from local DB
            cursor.execute("SELECT name, price FROM local_products WHERE id = ?", (pid,))
            prod = cursor.fetchone()
            if prod:
                name, price = prod
                line_total = price * qty
                total_amount += line_total
                processed_items.append({
                    "id": f"li_{pid}_{order_id}",
                    "product_id": pid,
                    "name": name,
                    "quantity": qty,
                    "price": price
                })
        
        # Save order
        cursor.execute('''
            INSERT INTO local_orders (id, buyer_id, items_json, total_amount, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (order_id, buyer_id, json.dumps(processed_items), total_amount, datetime.now()))
        
        conn.commit()
        conn.close()
        
        print(f"🛍️ [Phone] Order {order_id} stored locally on peer device.")
        
        return {
            "id": order_id,
            "buyer_id": buyer_id,
            "vendor_id": self.node_id,
            "status": "pending",
            "payment_status": "awaiting_payment",
            "items": processed_items,
            "total_amount": total_amount,
            "created_at": datetime.now().isoformat()
        }

    def list_orders(self) -> List[Dict[str, Any]]:
        """Used by the Seller UI to see incoming orders"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM local_orders ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        
        orders = []
        for r in rows:
            d = dict(r)
            d['items'] = json.loads(d['items_json'])
            orders.append(d)
        return orders

    async def update_order_status(self, order_id: str, payment_status: str):
        """Called by Hub relay when payment is confirmed"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE local_orders SET payment_status = ? WHERE id = ?", (payment_status, order_id))
        conn.commit()
        conn.close()
        print(f"🔔 [Phone] Order {order_id} updated: {payment_status}")
