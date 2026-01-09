from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

app = FastAPI()

# ============ PRODUCT CATALOG ============
PRODUCTS = [
    {"id": "p1", "name": "Black T-Shirt", "description": "Cotton black t-shirt", "price": 299, "size": "L", "seller_location": "Civil Lines", "stock": 10},
    {"id": "p2", "name": "Black T-Shirt", "description": "Cotton black t-shirt", "price": 349, "size": "M", "seller_location": "Rajpur Road", "stock": 5},
    {"id": "p3", "name": "White T-Shirt", "description": "Premium white t-shirt", "price": 399, "size": "L", "seller_location": "Civil Lines", "stock": 8},
    {"id": "p4", "name": "Blue Jeans", "description": "Denim blue jeans", "price": 799, "size": "32", "seller_location": "Mall Road", "stock": 12},
    {"id": "p5", "name": "Red Hoodie", "description": "Warm red hoodie", "price": 599, "size": "L", "seller_location": "Civil Lines", "stock": 3},
]

# ============ DATA STORES ============
CARTS = {}
ORDERS = {}
USERS = {
    "user-123": {"id": "user-123", "name": "John Doe", "email": "john@example.com", "address": "123 Main St"}
}

# ============ REQUEST MODELS ============
class CartRequest(BaseModel):
    user_id: str

class AddItemRequest(BaseModel):
    cart_id: str
    product_id: str
    qty: int

class OrderRequest(BaseModel):
    cart_id: str
    user_id: str
    delivery_slot: Optional[str] = None

# ============ CORE FUNCTIONS ============

@app.get("/catalog/search")
def search_catalog(q: Optional[str] = None, size: Optional[str] = None, max_price: Optional[float] = None, location: Optional[str] = None, quantity: Optional[int] = None):
    """Search products - CORE FUNCTIONALITY"""
    results = PRODUCTS.copy()
    if q:
        q_lower = q.lower()
        results = [p for p in results if q_lower in p["name"].lower() or q_lower in p["description"].lower()]
    if size:
        results = [p for p in results if p.get("size") == size]
    if max_price:
        results = [p for p in results if p["price"] <= max_price]
    if location:
        results = [p for p in results if location.lower() in p["seller_location"].lower()]
    if quantity:
        results = [p for p in results if p["stock"] >= quantity]
    return {"items": results}

@app.post("/cart")
def create_cart(req: CartRequest):
    """Create cart - CORE FUNCTIONALITY"""
    cart_id = f"cart-{uuid.uuid4().hex[:8]}"
    cart = {"cart_id": cart_id, "user_id": req.user_id, "items": []}
    CARTS[cart_id] = cart
    return cart

@app.post("/cart/{cart_id}/items")
def add_item_to_cart(cart_id: str, req: AddItemRequest):
    """Add to cart - CORE FUNCTIONALITY"""
    if cart_id not in CARTS:
        raise HTTPException(status_code=404, detail="Cart not found")
    product = next((p for p in PRODUCTS if p["id"] == req.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cart = CARTS[cart_id]
    item_idx = next((i for i, item in enumerate(cart["items"]) if item["product_id"] == req.product_id), None)
    if item_idx is not None:
        cart["items"][item_idx]["qty"] += req.qty
    else:
        cart["items"].append({"product_id": req.product_id, "name": product["name"], "price": product["price"], "size": product.get("size"), "qty": req.qty})
    return cart

@app.get("/cart/{cart_id}")
def get_cart(cart_id: str):
    """Get cart contents - CORE FUNCTIONALITY"""
    if cart_id not in CARTS:
        raise HTTPException(status_code=404, detail="Cart not found")
    cart = CARTS[cart_id]
    total_price = sum(item["price"] * item["qty"] for item in cart["items"])
    return {"cart_id": cart["cart_id"], "user_id": cart["user_id"], "items": cart["items"], "total_price": total_price}

@app.post("/order")
def create_order(req: OrderRequest):
    """Create order - CORE FUNCTIONALITY"""
    if req.cart_id not in CARTS:
        raise HTTPException(status_code=404, detail="Cart not found")
    cart = CARTS[req.cart_id]
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    order_id = f"order-{uuid.uuid4().hex[:8]}"
    total_price = sum(item["price"] * item["qty"] for item in cart["items"])
    
    order = {
        "order_id": order_id,
        "status": "placed",
        "user_id": req.user_id,
        "items": cart["items"],
        "delivery_slot": req.delivery_slot or "today 5-7pm",
        "total_price": total_price,
        "created_at": datetime.utcnow().isoformat(),
        "payment_status": "pending",  # MOCKED
        "delivery_status": "not_started"  # MOCKED
    }
    
    ORDERS[order_id] = order
    CARTS[req.cart_id]["items"] = []
    
    # MOCKED: Call payment service
    _call_payment_service(order_id, total_price)
    
    # MOCKED: Call inventory service
    _update_inventory(cart["items"])
    
    return order

@app.get("/order/{order_id}")
def get_order(order_id: str):
    """Get order status - CORE FUNCTIONALITY"""
    if order_id not in ORDERS:
        return {"order_id": order_id, "status": "unknown"}
    order = ORDERS[order_id]
    return {
        "order_id": order["order_id"],
        "status": order["status"],
        "payment_status": order["payment_status"],
        "delivery_status": order["delivery_status"],
        "items": order["items"],
        "total_price": order["total_price"],
        "delivery_slot": order["delivery_slot"]
    }

# ============ MOCKED SERVICES ============

def _call_payment_service(order_id: str, amount: float):
    """MOCKED: Payment Service"""
    # In real world: call payment gateway (Stripe, PayPal, etc)
    print(f"[MOCKED PAYMENT] Processing ${amount} for order {order_id}")
    if order_id in ORDERS:
        ORDERS[order_id]["payment_status"] = "completed"

def _update_inventory(items: list):
    """MOCKED: Inventory Service"""
    # In real world: call inventory service to update stock
    print(f"[MOCKED INVENTORY] Updated stock for {len(items)} items")

def _send_notification(user_id: str, message: str):
    """MOCKED: Notification Service"""
    # In real world: send SMS/Email/Push notification
    print(f"[MOCKED NOTIFICATION] To {user_id}: {message}")

def _start_delivery(order_id: str):
    """MOCKED: Delivery Service"""
    # In real world: call delivery partner API
    print(f"[MOCKED DELIVERY] Started delivery for order {order_id}")
    if order_id in ORDERS:
        ORDERS[order_id]["delivery_status"] = "in_transit"

# ============ UTILITY ENDPOINTS ============

@app.get("/health")
def health():
    return {"status": "ok", "service": "ecommerce-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)