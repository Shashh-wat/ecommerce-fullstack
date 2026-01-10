from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import json
from datetime import datetime
import traceback
import asyncio

# ============ MCP SETUP (Standard Pattern) ============
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from mcp.types import Tool, TextContent, ImageContent, EmbeddedResource

mcp_server = Server("Kozhikode Reconnect Store")

# ============ FASTAPI SETUP ============

app = FastAPI(title="E-Commerce Multi-Vendor Platform + MCP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ DATABASE & SUPABASE SETUP ============
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ecommerce")

try:
    engine = create_engine(
        DATABASE_URL,
        poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
        echo=False
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"⚠️  Database connection failed (Non-Fatal): {e}")
    # We continue without DB, using in-memory fallbacks
    engine = None
    SessionLocal = None

Base = declarative_base()

# ... (Supabase client setup)

# ============ FASTAPI SETUP ============

app = FastAPI(title="E-Commerce Multi-Vendor Platform + MCP")

# Fix for Render Health Check (HEAD method) and Root Path
@app.get("/")
@app.head("/")
async def root():
    # Attempt to serve index.html if it exists
    if os.path.isfile("dist/index.html"):
        return FileResponse("dist/index.html")
    return {"status": "ok", "message": "Backend running. Frontend not found in /dist."}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    supabase_id = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    role = Column(String(20), default="buyer")
    created_at = Column(DateTime, default=datetime.utcnow)

class VendorModel(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    supabase_id = Column(String(255), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    verification_status = Column(String(20), default="pending")
    commission_percentage = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductModel(Base):
    __tablename__ = "products"
    id = Column(String(50), primary_key=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500))
    price = Column(Float, nullable=False)
    size = Column(String(50))
    seller_location = Column(String(255))
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class OrderModel(Base):
    __tablename__ = "orders"
    order_id = Column(String(50), primary_key=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    user_id = Column(String(100))
    items = Column(JSON)
    total_price = Column(Float)
    delivery_slot = Column(String(100))
    status = Column(String(50), default="placed")
    payment_status = Column(String(50), default="pending")
    delivery_status = Column(String(50), default="not_started")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InventoryHistoryModel(Base):
    __tablename__ = "inventory_history"
    id = Column(Integer, primary_key=True)
    product_id = Column(String(50), ForeignKey("products.id"))
    old_stock = Column(Integer)
    new_stock = Column(Integer)
    changed_by = Column(Integer)
    reason = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationModel(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String(500))
    type = Column(String(50))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

if engine:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"⚠️  Error creating tables: {e}")

# ============ IN-MEMORY DATA STORES ============

PRODUCTS = [
    {"id": "p1", "name": "Black T-Shirt", "description": "Cotton black t-shirt", "price": 299, "size": "L", "seller_location": "Civil Lines", "stock": 10},
    {"id": "p2", "name": "Black T-Shirt", "description": "Cotton black t-shirt", "price": 349, "size": "M", "seller_location": "Rajpur Road", "stock": 5},
    {"id": "p3", "name": "White T-Shirt", "description": "Premium white t-shirt", "price": 399, "size": "L", "seller_location": "Civil Lines", "stock": 8},
    {"id": "p4", "name": "Blue Jeans", "description": "Denim blue jeans", "price": 799, "size": "32", "seller_location": "Mall Road", "stock": 12},
    {"id": "p5", "name": "Red Hoodie", "description": "Warm red hoodie", "price": 599, "size": "L", "seller_location": "Civil Lines", "stock": 3},
]
CARTS = {}
ORDERS = {}

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

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class VendorRegisterRequest(BaseModel):
    email: str
    password: str
    business_name: str
    name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: Optional[str] = None
    vendor_id: Optional[int] = None
    role: str
    name: Optional[str] = None
    business_name: Optional[str] = None
    email: str

# ============ HELPERS ============

def get_db():
    if not SessionLocal: return None
    db = SessionLocal()
    try: yield db
    finally: db.close()

def verify_supabase_token(token: str = Header(None)):
    if not token or not supabase: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        user = supabase.auth.get_user(token)
        if not user: raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except: raise HTTPException(status_code=401, detail="Invalid token")

def verify_vendor_token(token: str = Header(None), db: Session = Depends(get_db)):
    user = verify_supabase_token(token)
    if not db: raise HTTPException(status_code=500, detail="DB unavailable")
    vendor = db.query(VendorModel).filter(VendorModel.supabase_id == str(user.user.id)).first()
    if not vendor: raise HTTPException(status_code=403, detail="Vendor access required")
    return {"user": user, "vendor": vendor}

def _update_inventory(items):
    pass

def _call_payment_service(order_id, amount):
    print(f"💸 Processing payment for order {order_id}: ₹{amount}")
    return True

# ============ CORE LOGIC (SHARED) ============

def core_search_catalog(q: Optional[str] = None, size: Optional[str] = None, max_price: Optional[float] = None, location: Optional[str] = None, quantity: Optional[int] = None):
    try:
        if supabase:
            response = supabase.table("products").select("*").execute()
            results = response.data if response.data else []
        else:
            results = PRODUCTS.copy()
        
        if q:
            q_lower = q.lower()
            results = [p for p in results if q_lower in str(p.get("name", "")).lower() or q_lower in str(p.get("description", "")).lower()]
        if size: results = [p for p in results if p.get("size") == size]
        if max_price: results = [p for p in results if p.get("price", 0) <= max_price]
        if location: results = [p for p in results if location.lower() in str(p.get("seller_location", "")).lower()]
        if quantity: results = [p for p in results if p.get("stock", 0) >= quantity]
        
        return results
    except Exception as e:
        print(f"Search error: {e}")
        return []

def core_create_cart(user_id: str):
    cart_id = f"cart-{uuid.uuid4().hex[:8]}"
    cart = {"cart_id": cart_id, "user_id": user_id, "items": []}
    CARTS[cart_id] = cart
    return cart

def core_add_item(cart_id: str, product_id: str, qty: int):
    if cart_id not in CARTS: return None
    
    product = None
    if supabase:
        try:
            resp = supabase.table("products").select("*").eq("id", product_id).execute()
            if resp.data: product = resp.data[0]
        except: pass
    
    if not product:
        product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    
    if not product: return False
    
    cart = CARTS[cart_id]
    item_idx = next((i for i, item in enumerate(cart["items"]) if item["product_id"] == product_id), None)
    if item_idx is not None:
        cart["items"][item_idx]["qty"] += qty
    else:
        cart["items"].append({"product_id": product_id, "name": product["name"], "price": product["price"], "size": product.get("size"), "qty": qty})
    return cart

def core_create_order(cart_id: str, user_id: str, delivery_slot: str):
    if cart_id not in CARTS: return None
    cart = CARTS[cart_id]
    if not cart["items"]: return "empty"
    
    order_id = f"order-{uuid.uuid4().hex[:8]}"
    total_price = sum(item["price"] * item["qty"] for item in cart["items"])
    
    order = {
        "order_id": order_id,
        "status": "placed",
        "user_id": user_id,
        "items": cart["items"],
        "delivery_slot": delivery_slot,
        "total_price": total_price,
        "created_at": datetime.utcnow().isoformat(),
        "payment_status": "pending",
        "delivery_status": "not_started"
    }
    
    ORDERS[order_id] = order
    CARTS[cart_id]["items"] = []
    
    if SessionLocal:
        db = SessionLocal()
        try:
            db_order = OrderModel(
                order_id=order_id,
                user_id=user_id,
                items=cart["items"],
                total_price=total_price,
                delivery_slot=delivery_slot,
                status="placed"
            )
            db.add(db_order)
            db.commit()
            db.close()
        except: pass
        
    return order

# ============ MCP TOOLS (Standard Server Pattern) ============

@mcp_server.list_tools()
async def handle_list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_products",
            description="Search for products in the catalog",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_price": {"type": "number"},
                    "location": {"type": "string"}
                }
            }
        ),
        Tool(
            name="create_new_cart",
            description="Create a shopping cart",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"}
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="add_product_to_cart",
            description="Add item to cart",
            inputSchema={
                "type": "object",
                "properties": {
                    "cart_id": {"type": "string"},
                    "product_id": {"type": "string"},
                    "quantity": {"type": "integer"}
                },
                "required": ["cart_id", "product_id"]
            }
        )
    ]

@mcp_server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[TextContent | ImageContent | EmbeddedResource]:
    if name == "search_products":
        results = core_search_catalog(
            q=arguments.get("query"),
            max_price=arguments.get("max_price"),
            location=arguments.get("location")
        )
        return [TextContent(type="text", text=str(results))]
    
    if name == "create_new_cart":
        res = core_create_cart(arguments.get("user_id"))
        return [TextContent(type="text", text=str(res))]
        
    if name == "add_product_to_cart":
        res = core_add_item(
            arguments.get("cart_id"),
            arguments.get("product_id"),
            arguments.get("quantity", 1)
        )
        return [TextContent(type="text", text=str(res))]
        
    raise ValueError(f"Unknown tool: {name}")

# ============ MCP SSE ENDPOINTS ============

@app.get("/sse")
async def handle_sse(request: Request):
    """MCP SSE Endpoint"""
    async def event_generator():
        transport = SseServerTransport("/messages")
        async with mcp_server.run(transport.read_incoming(), transport.write_outgoing()) as stream:
             async for message in stream:
                 yield message
                 
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/messages")
async def handle_messages(request: Request):
    """MCP Messages Endpoint (Not fully implemented for read-write bridging in single process mode)"""
    # This acts as a placeholder. In a real persistent MCP-over-SSE setup,
    # we need to route this back to the transport created in /sse.
    # Since HTTP is stateless, we can't easily pipe this to the *specific* running /sse connection
    # without a session manager.
    #
    # FOR NOW: We return 200 to not crash, but real bidirectional MCP over HTTP requires
    # a memory store for active transports.
    return {"status": "ok"}

# ============ WEB ENDPOINTS ============

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ecommerce-backend-unified"}

@app.get("/catalog/search")
def search_catalog_api(q: Optional[str] = None, size: Optional[str] = None, max_price: Optional[float] = None, location: Optional[str] = None, quantity: Optional[int] = None):
    return {"items": core_search_catalog(q, size, max_price, location, quantity)}

# ALIASES YOU REQUESTED
@app.get("/products")
def get_products_alias(q: Optional[str] = None):
    return {"items": core_search_catalog(q=q)}

@app.get("/products/{product_id}")
def get_product_details(product_id: str):
    if supabase:
        response = supabase.table("products").select("*").eq("id", product_id).execute()
        if response.data: return response.data[0]
    return next((p for p in PRODUCTS if p["id"] == product_id), None)

@app.post("/cart")
def api_create_cart(req: CartRequest):
    return core_create_cart(req.user_id)

@app.post("/cart/{cart_id}/items")
def api_add_item(cart_id: str, req: AddItemRequest):
    res = core_add_item(cart_id, req.product_id, req.qty)
    if res is None: raise HTTPException(404, "Cart not found")
    if res is False: raise HTTPException(404, "Product not found")
    return res

@app.get("/cart/{cart_id}")
def api_get_cart(cart_id: str):
    if cart_id not in CARTS: raise HTTPException(404, "Cart not found")
    cart = CARTS[cart_id]
    total = sum(item["price"] * item["qty"] for item in cart["items"])
    return {"cart_id": cart_id, "items": cart["items"], "total_price": total}

@app.post("/order")
def api_create_order(req: OrderRequest, db: Session = Depends(get_db)):
    res = core_create_order(req.cart_id, req.user_id, req.delivery_slot or "today")
    if res == "empty": raise HTTPException(400, "Cart empty")
    if res is None: raise HTTPException(404, "Cart not found")
    return res

@app.post("/orders") # Alias
def api_create_order_alias(req: OrderRequest, db: Session = Depends(get_db)):
    return api_create_order(req, db)

# ... (Auth endpoints skipped, but should be here)

# ============ FRONTEND SERVING (MUST BE LAST) ============

if os.path.isdir("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api") or full_path.startswith("auth") or full_path.startswith("catalog") or full_path.startswith("mcp") or full_path.startswith("sse"):
        raise HTTPException(status_code=404, detail="Not Found")
    
    file_path = f"dist/{full_path}"
    if os.path.isfile(file_path): return FileResponse(file_path)
    index_path = "dist/index.html"
    if os.path.isfile(index_path): return FileResponse(index_path)
    return {"message": "Frontend not found"}
