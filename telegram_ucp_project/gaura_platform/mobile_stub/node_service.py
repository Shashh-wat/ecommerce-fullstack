from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn
import os
import sys
from dotenv import load_dotenv

# Add parent dir to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"))

from gaura_platform.mobile_stub.node import MobileNode

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In a real app, this would be initialized with the user's secure keys
NODE_ID = os.getenv("NODE_ID", "phone_default")
NODE_DB = f"{NODE_ID}_vault.db"
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "MOCK_KEY")

node = MobileNode(NODE_ID, NODE_DB, GEMINI_KEY)

class ExecuteRequest(BaseModel):
    action: str
    payload: Dict[str, Any]

@app.post("/execute")
async def execute(request: ExecuteRequest):
    """
    Relay Endpoint: The Hub calls this to execute logic on the phone.
    """
    print(f"📲 [Phone {NODE_ID}] Received Relay Action: {request.action}")
    
    if request.action == "get_product_details":
        product_id = request.payload.get("product_id")
        details = node.get_product_details(product_id)
        if details:
            return {"status": "success", "data": details}
        return {"status": "error", "message": "Product not found"}
    
    elif request.action == "get_tech_report":
        product_id = request.payload.get("product_id")
        details = node.get_product_details(product_id)
        report_path = os.path.join("gaura_platform/mobile_stub/local_vault/reports", f"report_{product_id}.md")
        
        if os.path.exists(report_path) and details:
            with open(report_path, "r") as f:
                content = f.read()
            return {
                "status": "success", 
                "data": {
                    "report": content,
                    "price": details.get("price"),
                    "name": details.get("name")
                }
            }
        return {"status": "error", "message": "Report or product not found"}

    elif request.action == "create_order":
        buyer_id = request.payload.get("buyer_id")
        items = request.payload.get("items")
        order = await node.create_order(buyer_id, items)
        return {"status": "success", "data": order}

    elif request.action == "list_orders":
        orders = node.list_orders()
        return {"status": "success", "data": orders}

    elif request.action == "process_seller_upload":
        name = request.payload.get("name")
        cat = request.payload.get("category")
        price = request.payload.get("price")
        img = request.payload.get("image_data")
        product = await node.process_seller_upload(name, cat, price, img)
        return {"status": "success", "data": product}

    elif request.action == "update_order":
        order_id = request.payload.get("order_id")
        p_status = request.payload.get("payment_status")
        await node.update_order_status(order_id, p_status)
        return {"status": "success"}

    return {"status": "error", "message": "Unknown action"}

if __name__ == "__main__":
    port = int(os.getenv("NODE_PORT", 9001))
    uvicorn.run(app, host="0.0.0.0", port=port)
