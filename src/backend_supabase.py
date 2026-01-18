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
# ============ DATABASE & SUPABASE SETUP ============

# NOTE: We have switched to FULL HTTP MODE. 
# We use the Supabase Python Client (HTTPS) for everything.
# No direct SQL/TCP connections (SQLAlchemy) to avoid firewall/network issues.

# ... (Supabase client setup is done below in existing code)

# ============ CORE LOGIC (SHARED) ============

PRODUCTS = [
    {"id": "p1", "name": "Black T-Shirt", "description": "Cotton black t-shirt", "price": 299, "size": "L", "seller_location": "Civil Lines", "stock": 10},
    {"id": "p2", "name": "Black T-Shirt", "description": "Cotton black t-shirt", "price": 349, "size": "M", "seller_location": "Rajpur Road", "stock": 5},
    {"id": "p3", "name": "White T-Shirt", "description": "Premium white t-shirt", "price": 399, "size": "L", "seller_location": "Civil Lines", "stock": 8},
    {"id": "p4", "name": "Blue Jeans", "description": "Denim blue jeans", "price": 799, "size": "32", "seller_location": "Mall Road", "stock": 12},
    {"id": "p5", "name": "Red Hoodie", "description": "Warm red hoodie", "price": 599, "size": "L", "seller_location": "Civil Lines", "stock": 3},
]
CARTS = {}
ORDERS = {}

def core_search_catalog(q: Optional[str] = None, size: Optional[str] = None, max_price: Optional[float] = None, location: Optional[str] = None, quantity: Optional[int] = None):
    try:
        # Check if global supabase client is initialized
        is_supabase_connected = 'supabase' in globals() and globals()['supabase'] is not None
        
        if is_supabase_connected:
            query = globals()['supabase'].table("products").select("*")
            # Supabase Python client filtering
            if q: query = query.ilike("name", f"%{q}%") # Basic text search
            if size: query = query.eq("size", size)
            if max_price: query = query.lte("price", max_price)
            if location: query = query.ilike("seller_location", f"%{location}%")
            
            response = query.execute()
            results = response.data if response.data else []
            
            # Additional client-side filtering if needed (e.g. description)
            if q:
                # The API ilike only checks name above, let's include description matches from memory if dataset small
                # Or just rely on what we got.
                pass
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
    # In this simplified architecture without a dedicated 'carts' table schema provided in the SQL seed,
    # We will keep Active Carts IN MEMORY.
    # Orders will be pushed to Supabase PERMANENTLY.
    # This is a hybrid approach perfect for this stage.
    cart_id = f"cart-{uuid.uuid4().hex[:8]}"
    cart = {"cart_id": cart_id, "user_id": user_id, "items": []}
    CARTS[cart_id] = cart
    return cart

def core_add_item(cart_id: str, product_id: str, qty: int):
    if cart_id not in CARTS: return None
    
    product = None
    is_supabase_connected = 'supabase' in globals() and globals()['supabase'] is not None
    
    if is_supabase_connected:
        try:
            resp = globals()['supabase'].table("products").select("*").eq("id", product_id).execute()
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
    
    ORDERS[order_id] = order # Memory Store
    CARTS[cart_id]["items"] = [] # Clear Cart
    
    # PERSIST TO SUPABASE VIA HTTP API
    is_supabase_connected = 'supabase' in globals() and globals()['supabase'] is not None
    if is_supabase_connected:
        try:
            db_order = {
                "order_id": order_id,
                "user_id": user_id,
                "items": cart["items"], # JsonB
                "total_price": total_price,
                "delivery_slot": delivery_slot,
                "status": "placed"
            }
            globals()['supabase'].table("orders").insert(db_order).execute()
            print(f"✅ Order {order_id} saved to Supabase via API")
        except Exception as e: 
            print(f"⚠️ Failed to save order to Supabase (saved in memory): {e}")
        
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

# ============ LLM ORCHESTRATION (THE "BRAIN") ============
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

# Initialize Google Gemini Client
# We use the same key as the frontend for simplicity in this demo environment, 
# though usually backend keys are separate.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️ WARNING: GEMINI_API_KEY not found. Chat will not work.")

# In-Memory State Management
CHAT_HISTORY = {} # Key: user_id, Value: List[Content]
USER_CONTEXT = {} # Key: user_id, Value: {"cart_id": str, "last_search": list}

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "anon"
    context: Optional[dict] = {}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    user_id = req.user_id
    print(f"🤖 Agent received from {user_id}: {req.message}")

    # 1. Initialize Context
    if user_id not in CHAT_HISTORY: CHAT_HISTORY[user_id] = []
    if user_id not in USER_CONTEXT: USER_CONTEXT[user_id] = {"cart_id": None, "last_search": []}

    # Sync with existing backend carts (if user created cart via UI)
    if USER_CONTEXT[user_id]["cart_id"] is None:
        existing_cart = next((c for c in CARTS.values() if c["user_id"] == user_id), None)
        if existing_cart:
            USER_CONTEXT[user_id]["cart_id"] = existing_cart["cart_id"]
            print(f"🤖 Linked existing cart {existing_cart['cart_id']} to user {user_id}")
    
    context = USER_CONTEXT[user_id]
    
    # 2. Construct System Prompt (Gemini 1.5+ supports system instructions)
    cart_info = f"Current Cart ID: {context['cart_id']}" if context['cart_id'] else "No active cart. Create one if needed."
    
    search_context = ""
    if context['last_search']:
        items_str = "\n".join([f"- ID: {p['id']}, Name: {p['name']}, Price: {p['price']}" for p in context['last_search'][:5]])
        search_context = f"\nRECENT SEARCH RESULTS (User might refer to these as 'the first one', 'that t-shirt', etc):\n{items_str}"

    system_instruction = (
        "You are a helpful E-commerce assistant for Kozhikode Reconnect. "
        "Your goal is to help users find products, manage their cart, and place orders. "
        f"{cart_info} "
        f"{search_context} "
        "\nRULES:\n"
        "- If user asks to 'add to cart' and you have a Cart ID, use it. If not, call create_cart first.\n"
        "- If user refers to a product vaguely ('add it'), check the Recent Search Results.\n"
        "- Always confirm actions politely."
    )

    # 3. Define Tools (Gemini Format)
    tools = [
        # Search
        FunctionDeclaration(
            name="search_products",
            description="Search for products. Returns list of items.",
            parameters={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Keywords"},
                    "max_price": {"type": "number"},
                    "location": {"type": "string"}
                }
            }
        ),
        # Create Cart
        FunctionDeclaration(
            name="create_cart",
            description="Create a new shopping cart. Returns cart info.",
            parameters={"type": "object", "properties": {}}
        ),
        # Get Cart
        FunctionDeclaration(
            name="get_my_cart",
            description="Get current cart details.",
            parameters={"type": "object", "properties": {}}
        ),
        # Add to Cart
        FunctionDeclaration(
            name="add_to_cart",
            description="Add product to cart.",
            parameters={
                "type": "object",
                "properties": {
                    "product_id": {"type": "string"},
                    "quantity": {"type": "integer"}
                },
                "required": ["product_id"]
            }
        ),
        # Place Order
        FunctionDeclaration(
            name="place_order",
            description="Checkout and place order from current cart.",
            parameters={
                "type": "object",
                "properties": {
                    "delivery_slot": {"type": "string"}
                }
            }
        )
    ]
    
    # Initialize Model
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp", # Using the same model as frontend voice
        tools=tools,
        system_instruction=system_instruction
    )

    # Start/Resume Chat Session
    # Gemini manages history in the ChatSession object mostly, but for stateless REST API pattern
    # we usually rebuild history or use a persistent chat object. 
    # For robust simplification here: we'll rebuild history for the session.
    
    # Convert our simplified history dict to Gemini content format
    gemini_history = []
    for msg in CHAT_HISTORY[user_id]:
        role = "user" if msg["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg["content"]]})

    chat_session = model.start_chat(history=gemini_history)

    try:
        # SEND MESSAGE
        response = chat_session.send_message(req.message)
        
        # HANDLE TOOL CALLS (Part of the Turn)
        # Gemini often executes function calls automatically if configured, or returns a FunctionCall part.
        # With default auto-function calling in Python SDK, it might handle it or we handle it manually.
        # We will handle it manually to be safe and update OUR backend state (CONTEXT).
        
        final_text = ""
        
        # Check parts for function calls
        for part in response.parts:
            if fn := part.function_call:
                print(f"🛠️ Tool Call: {fn.name} {fn.args}")
                
                tool_result = {"error": "Unknown tool"}
                
                # EXECUTE TOOL
                if fn.name == "search_products":
                    items = core_search_catalog(
                        q=fn.args.get("query"),
                        max_price=fn.args.get("max_price"),
                        location=fn.args.get("location")
                    )
                    tool_result = items
                    USER_CONTEXT[user_id]["last_search"] = items # Update Context

                elif fn.name == "create_cart":
                    cart = core_create_cart(user_id)
                    tool_result = cart
                    USER_CONTEXT[user_id]["cart_id"] = cart["cart_id"] 

                elif fn.name == "get_my_cart":
                    cid = context.get("cart_id")
                    if not cid: tool_result = {"status": "No active cart found."}
                    else:
                        if cid in CARTS: tool_result = CARTS[cid]
                        else: tool_result = {"status": "Cart expired."}

                elif fn.name == "add_to_cart":
                    cid = context.get("cart_id")
                    if not cid:
                        cart = core_create_cart(user_id)
                        cid = cart["cart_id"]
                        USER_CONTEXT[user_id]["cart_id"] = cid
                    
                    res = core_add_item(cid, fn.args.get("product_id"), int(fn.args.get("quantity", 1)))
                    tool_result = {"status": "Item added" if res else "Product not found"}

                elif fn.name == "place_order":
                    cid = context.get("cart_id")
                    if not cid: tool_result = {"status": "No cart to checkout"}
                    else:
                        res = core_create_order(cid, user_id, fn.args.get("delivery_slot", "Standard"))
                        if isinstance(res, dict):
                             tool_result = {"status": "Order Placed", "order_id": res.get("order_id")}
                             USER_CONTEXT[user_id]["cart_id"] = None
                        else:

        return {"response": final_content}

    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return simulated_agent(req.message)

def simulated_agent(message: str):
    """Fallback rule-based response if LLM is unavailable"""
    msg = message.lower()
    if "hello" in msg:
        return {"response": "Hello! I am your Kozhikode Reconnect assistant. You can ask me to search for products!"}
    if "product" in msg or "buy" in msg or "search" in msg:
        # Trigger explicit search
        items = core_search_catalog(q=msg.replace("search", "").replace("products", "").strip())
        if items:
            names = ", ".join([i["name"] for i in items[:3]])
            return {"response": f"I found some products for you: {names}. Would you like to add any to your cart?"}
        return {"response": "I couldn't find any products matching that description."}
    return {"response": "I am currently in offline mode. Please ask about products!"}


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
