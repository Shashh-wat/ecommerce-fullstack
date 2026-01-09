from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
import os

# ============ DATABASE SETUP ============
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
    print(f"⚠️  Database connection failed: {e}")
    engine = None
    SessionLocal = None

Base = declarative_base()

# ============ SUPABASE SETUP ============
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-key")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase connected")
except Exception as e:
    print(f"⚠️  Supabase connection failed: {e}")
    supabase = None

# ============ SQLALCHEMY MODELS ============

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    supabase_id = Column(String(255), unique=True, nullable=False)  # UUID from Supabase
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

# Create tables on startup
if engine:
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified")
    except Exception as e:
        print(f"⚠️  Error creating tables: {e}")

# ============ FASTAPI SETUP ============

app = FastAPI(title="E-Commerce Multi-Vendor Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount the static directory (frontend build)
# Mount the static directory (frontend build)
# We'll expect the 'dist' folder to be in the same directory for deployment
if os.path.isdir("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
else:
    print("⚠️  'dist' directory not found or is not a directory. Frontend assets will not be served.")

@app.get("/health")
def health_check():
    """Health check endpoint for Cloud Run"""
    return {"status": "ok", "service": "ecommerce-backend-supabase"}

# Serve the frontend index.html for any unmatched routes (SPA support)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # API routes should have been caught above, so this is for frontend routes
    if full_path.startswith("api") or full_path.startswith("auth") or full_path.startswith("catalog"):
        raise HTTPException(status_code=404, detail="Not Found")
    
    # Check if a specific file exists in dist (e.g. favicon.ico)
    # IMPORTANT: Use os.path.isfile to avoid trying to serve a directory as a file
    file_path = f"dist/{full_path}"
    if os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Otherwise return index.html for SPA routing
    index_path = "dist/index.html"
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    
    return {"message": "Frontend not found. Run 'npm run build' and ensure 'dist' folder exists."}

# ============ IN-MEMORY DATA STORES (UNCHANGED) ============

PRODUCTS = [
    {"id": "p1", "name": "Black T-Shirt", "description": "Cotton black t-shirt", "price": 299, "size": "L", "seller_location": "Civil Lines", "stock": 10},
    {"id": "p2", "name": "Black T-Shirt", "description": "Cotton black t-shirt", "price": 349, "size": "M", "seller_location": "Rajpur Road", "stock": 5},
    {"id": "p3", "name": "White T-Shirt", "description": "Premium white t-shirt", "price": 399, "size": "L", "seller_location": "Civil Lines", "stock": 8},
    {"id": "p4", "name": "Blue Jeans", "description": "Denim blue jeans", "price": 799, "size": "32", "seller_location": "Mall Road", "stock": 12},
    {"id": "p5", "name": "Red Hoodie", "description": "Warm red hoodie", "price": 599, "size": "L", "seller_location": "Civil Lines", "stock": 3},
]

CARTS = {}
ORDERS = {}
USERS = {
    "user-123": {"id": "user-123", "name": "John Doe", "email": "john@example.com", "address": "123 Main St"}
}

# ============ REQUEST/RESPONSE MODELS ============

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
    user_id: Optional[str] = None  # Changed from int to str (Supabase returns UUID)
    vendor_id: Optional[int] = None
    role: str
    name: Optional[str] = None
    business_name: Optional[str] = None
    email: str

# ============ UTILITY FUNCTIONS ============

def get_db():
    """Database dependency"""
    if not SessionLocal:
        return None
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_supabase_token(token: str = Header(None)):
    """Verify Supabase JWT token"""
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    try:
        # Verify token with Supabase
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_vendor_token(token: str = Header(None), db: Session = Depends(get_db)):
    """Verify vendor access"""
    user = verify_supabase_token(token)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    # Check if user is vendor
    vendor = db.query(VendorModel).filter(VendorModel.supabase_id == str(user.user.id)).first()
    if not vendor:
        raise HTTPException(status_code=403, detail="Vendor access required")
    
    return {"user": user, "vendor": vendor}

# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/auth/buyer/register", response_model=TokenResponse)
def register_buyer(req: RegisterRequest):
    """Register a new buyer with Supabase"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    try:
        print(f"📝 Registering buyer: {req.email}")
        
        # Supabase creates user with new API format
        auth_response = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password
        })
        
        print(f"✅ Supabase response received")
        print(f"   User ID: {auth_response.user.id if auth_response and auth_response.user else 'None'}")
        
        # Auto-confirm the user (mark email as confirmed)
        if auth_response and auth_response.user:
            try:
                print(f"📝 Auto-confirming user email...")
                # Use admin API to confirm email
                supabase.auth.admin.update_user_by_id(
                    str(auth_response.user.id),
                    {"email_confirm": True}
                )
                print(f"✅ User email confirmed")
            except Exception as confirm_error:
                print(f"⚠️  Could not auto-confirm: {confirm_error}")
        
        # Session can be None if email confirmation is required
        access_token = None
        if auth_response and auth_response.session:
            access_token = auth_response.session.access_token
            print(f"✅ Got access token")
        else:
            # Use user ID as temporary token if confirmation required
            print(f"⚠️  Using user ID as temporary token")
            access_token = str(auth_response.user.id) if auth_response and auth_response.user else "temp"
        
        db = SessionLocal() if SessionLocal else None
        
        # Create user record in our DB
        if db:
            try:
                user = UserModel(
                    supabase_id=str(auth_response.user.id),
                    email=req.email,
                    name=req.name,
                    role="buyer"
                )
                db.add(user)
                db.commit()
                db.close()
                print(f"✅ Buyer registration successful!")
            except Exception as db_error:
                print(f"⚠️  Could not save to local DB: {db_error}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=auth_response.user.id,
            role="buyer",
            name=req.name,
            email=req.email
        )
    except Exception as e:
        print(f"❌ Buyer registration error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail="Registration failed: " + str(e))

@app.post("/auth/buyer/login", response_model=TokenResponse)
def login_buyer(req: LoginRequest):
    """Login buyer with Supabase"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    try:
        print(f"📝 Logging in buyer: {req.email}")
        
        # Try standard login first
        try:
            session = supabase.auth.sign_in_with_password({
                "email": req.email,
                "password": req.password
            })
            print(f"✅ Standard login successful")
        except Exception as login_error:
            # If email not confirmed error, get user another way
            if "Email not confirmed" in str(login_error):
                print(f"⚠️  Email not confirmed, using alternative login method")
                # Create a temporary session for unconfirmed users
                session = type('obj', (object,), {
                    'user': type('obj', (object,), {
                        'id': None  # Will be fetched from DB
                    })(),
                    'session': None
                })()
            else:
                raise login_error
        
        db = SessionLocal() if SessionLocal else None
        name = ""
        user_id = "unknown"
        access_token = None
        
        if db:
            try:
                user = db.query(UserModel).filter(UserModel.email == req.email).first()
                if user:
                    name = user.name
                    user_id = str(user.id)
                    # Generate a temporary token using the supabase_id
                    access_token = user.supabase_id
                db.close()
            except Exception as db_error:
                print(f"⚠️  Could not fetch user from DB: {db_error}")
        
        if not access_token and session and hasattr(session, 'session') and session.session:
            access_token = session.session.access_token
        
        if not access_token:
            access_token = str(session.user.id) if hasattr(session, 'user') and session.user and hasattr(session.user, 'id') else "temp"
        
        print(f"✅ Buyer login successful!")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user_id,
            role="buyer",
            name=name if name else req.email.split("@")[0],
            email=req.email
        )
    except Exception as e:
        print(f"❌ Buyer login error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")

@app.post("/auth/vendor/register", response_model=TokenResponse)
def register_vendor(req: VendorRegisterRequest):
    """Register a new vendor with Supabase"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    try:
        print(f"📝 Registering vendor: {req.email}")
        
        # Supabase creates user with new API format
        auth_response = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password
        })
        
        print(f"✅ Supabase response received")
        print(f"   User ID: {auth_response.user.id if auth_response and auth_response.user else 'None'}")
        print(f"   Session: {auth_response.session if auth_response and auth_response.session else 'None (email confirmation required)'}")
        
        # If auth response is None or missing user
        if not auth_response:
            raise Exception("Supabase returned empty response")
        
        if not hasattr(auth_response, 'user') or not auth_response.user:
            raise Exception("Supabase user object is None")
        
        # Auto-confirm the user (mark email as confirmed)
        if auth_response and auth_response.user:
            try:
                print(f"📝 Auto-confirming vendor email...")
                # Use admin API to confirm email
                supabase.auth.admin.update_user_by_id(
                    str(auth_response.user.id),
                    {"email_confirm": True}
                )
                print(f"✅ Vendor email confirmed")
            except Exception as confirm_error:
                print(f"⚠️  Could not auto-confirm: {confirm_error}")
        
        # Session can be None if email confirmation is required
        # That's OK - we can still create the vendor account
        access_token = None
        if auth_response.session:
            access_token = auth_response.session.access_token
            print(f"✅ Got access token (email confirmed)")
        else:
            # Email confirmation required - create a temporary token
            print(f"⚠️  Email confirmation required - using user ID as temporary token")
            access_token = str(auth_response.user.id)
        
        vendor_id = 1
        user_id = "1"  # Changed to string
        
        # Try to save to local DB if available (optional)
        if SessionLocal:
            try:
                db = SessionLocal()
                
                # Create user record
                user = UserModel(
                    supabase_id=str(auth_response.user.id),
                    email=req.email,
                    name=req.name,
                    role="vendor"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                user_id = str(user.id)  # Convert to string
                
                # Create vendor profile
                vendor = VendorModel(
                    user_id=user.id,
                    supabase_id=str(auth_response.user.id),
                    business_name=req.business_name,
                    email=req.email,
                    verification_status="pending"
                )
                db.add(vendor)
                db.commit()
                db.refresh(vendor)
                vendor_id = vendor.id
                db.close()
                
                print(f"✅ Saved to local DB: vendor_id={vendor_id}")
            except Exception as db_error:
                print(f"⚠️  Local DB save failed (using Supabase only): {db_error}")
        
        print(f"✅ Vendor registration successful!")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user_id,
            vendor_id=vendor_id,
            role="vendor",
            name=req.name,
            business_name=req.business_name,
            email=req.email
        )
    except Exception as e:
        print(f"❌ Vendor registration error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

@app.post("/auth/vendor/login", response_model=TokenResponse)
def login_vendor(req: LoginRequest):
    """Login vendor with Supabase"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    try:
        # Supabase authenticates the user with new API format
        session = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        
        if not session or not session.user:
            raise Exception("Login failed")
        
        vendor_id = 1
        user_id = "1"  # Changed to string
        business_name = "Store"
        name = req.email.split("@")[0]
        
        # Try to get details from local DB if available
        if SessionLocal:
            try:
                db = SessionLocal()
                
                # Get vendor profile
                vendor = db.query(VendorModel).filter(VendorModel.email == req.email).first()
                user = db.query(UserModel).filter(UserModel.email == req.email).first()
                
                if vendor:
                    vendor_id = vendor.id
                    business_name = vendor.business_name
                
                if user:
                    user_id = str(user.id)  # Convert to string
                    name = user.name
                
                db.close()
            except Exception as db_error:
                print(f"⚠️  Could not fetch from local DB: {db_error}")
        
        return TokenResponse(
            access_token=session.session.access_token,
            token_type="bearer",
            user_id=user_id,
            vendor_id=vendor_id,
            role="vendor",
            name=name,
            business_name=business_name,
            email=req.email
        )
    except Exception as e:
        print(f"❌ Vendor login error: {e}")
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")

# ============ BUYER ENDPOINTS (UNCHANGED - CORE FUNCTIONALITY) ============

@app.get("/catalog/search")
def search_catalog(q: Optional[str] = None, size: Optional[str] = None, max_price: Optional[float] = None, location: Optional[str] = None, quantity: Optional[int] = None):
    """Search products from Supabase database"""
    try:
        # Query Supabase database
        if supabase:
            response = supabase.table("products").select("*").execute()
            results = response.data if response.data else []
            print(f"🔍 Searching Supabase: Found {len(results)} total products")
        else:
            # Fallback to hardcoded list if Supabase unavailable
            results = PRODUCTS.copy()
            print(f"⚠️  Supabase unavailable, using hardcoded products ({len(results)} items)")
        
        # Apply filters
        if q:
            q_lower = q.lower()
            results = [p for p in results if q_lower in str(p.get("name", "")).lower() or q_lower in str(p.get("description", "")).lower()]
            print(f"   After query filter '{q}': {len(results)} products")
        
        if size:
            results = [p for p in results if p.get("size") == size]
            print(f"   After size filter '{size}': {len(results)} products")
        
        if max_price:
            results = [p for p in results if p.get("price", 0) <= max_price]
            print(f"   After price filter (<= {max_price}): {len(results)} products")
        
        if location:
            results = [p for p in results if location.lower() in str(p.get("seller_location", "")).lower()]
            print(f"   After location filter '{location}': {len(results)} products")
        
        if quantity:
            results = [p for p in results if p.get("stock", 0) >= quantity]
            print(f"   After stock filter (>= {quantity}): {len(results)} products")
        
        print(f"✅ Final results: {len(results)} products\n")
        return {"items": results}
    
    except Exception as e:
        print(f"❌ Search error: {e}")
        # Fallback to hardcoded products
        results = PRODUCTS.copy()
        if q:
            q_lower = q.lower()
            results = [p for p in results if q_lower in p["name"].lower() or q_lower in p["description"].lower()]
        return {"items": results}

@app.post("/cart")
def create_cart(req: CartRequest):
    """Create cart - UNCHANGED FROM ORIGINAL"""
    cart_id = f"cart-{uuid.uuid4().hex[:8]}"
    cart = {"cart_id": cart_id, "user_id": req.user_id, "items": []}
    CARTS[cart_id] = cart
    return cart

@app.post("/cart/{cart_id}/items")
def add_item_to_cart(cart_id: str, req: AddItemRequest):
    """Add to cart - UNCHANGED FROM ORIGINAL"""
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
    """Get cart contents - UNCHANGED FROM ORIGINAL"""
    if cart_id not in CARTS:
        raise HTTPException(status_code=404, detail="Cart not found")
    cart = CARTS[cart_id]
    total_price = sum(item["price"] * item["qty"] for item in cart["items"])
    return {"cart_id": cart["cart_id"], "user_id": cart["user_id"], "items": cart["items"], "total_price": total_price}

@app.post("/order")
def create_order(req: OrderRequest, db: Session = Depends(get_db)):
    """Create order - ENHANCED: Now saves to DB too"""
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
        "payment_status": "pending",
        "delivery_status": "not_started"
    }
    
    ORDERS[order_id] = order
    CARTS[req.cart_id]["items"] = []
    
    if db:
        try:
            db_order = OrderModel(
                order_id=order_id,
                user_id=req.user_id,
                items=cart["items"],
                total_price=total_price,
                delivery_slot=req.delivery_slot or "today 5-7pm",
                status="placed",
                payment_status="pending",
                delivery_status="not_started"
            )
            db.add(db_order)
            db.commit()
            print(f"✅ Order {order_id} saved to database")
        except Exception as e:
            print(f"⚠️  Could not save order to DB: {e}")
            db.rollback()
    
    _call_payment_service(order_id, total_price)
    _update_inventory(cart["items"])
    
    return order

@app.get("/order/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Get order status - UNCHANGED FROM ORIGINAL"""
    if order_id not in ORDERS:
        if db:
            try:
                db_order = db.query(OrderModel).filter(OrderModel.order_id == order_id).first()
                if db_order:
                    return {
                        "order_id": db_order.order_id,
                        "status": db_order.status,
                        "payment_status": db_order.payment_status,
                        "delivery_status": db_order.delivery_status,
                        "items": db_order.items,
                        "total_price": db_order.total_price,
                        "delivery_slot": db_order.delivery_slot
                    }
            except:
                pass
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

# ============ VENDOR ENDPOINTS ============

@app.get("/vendor/{vendor_id}/orders")
def get_vendor_orders(vendor_id: int, auth_data = Depends(verify_vendor_token), db: Session = Depends(get_db)):
    """Get all orders for a vendor"""
    if auth_data["vendor"].id != vendor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    orders = db.query(OrderModel).filter(OrderModel.vendor_id == vendor_id).all()
    
    return [
        {
            "order_id": order.order_id,
            "user_id": order.user_id,
            "items": order.items,
            "total_price": order.total_price,
            "delivery_slot": order.delivery_slot,
            "status": order.status,
            "payment_status": order.payment_status,
            "delivery_status": order.delivery_status,
            "created_at": order.created_at.isoformat() if order.created_at else None
        }
        for order in orders
    ]

@app.get("/vendor/{vendor_id}/dashboard")
def get_vendor_dashboard(vendor_id: int, auth_data = Depends(verify_vendor_token), db: Session = Depends(get_db)):
    """Get vendor dashboard statistics"""
    if auth_data["vendor"].id != vendor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    all_orders = db.query(OrderModel).filter(OrderModel.vendor_id == vendor_id).all()
    
    total_revenue = sum(order.total_price for order in all_orders)
    active_orders = len([o for o in all_orders if o.status in ["placed", "confirmed", "packed"]])
    delivered_orders = len([o for o in all_orders if o.status == "delivered"])
    pending_payment = len([o for o in all_orders if o.payment_status == "pending"])
    
    return {
        "vendor_id": vendor_id,
        "business_name": auth_data["vendor"].business_name,
        "verification_status": auth_data["vendor"].verification_status,
        "total_orders": len(all_orders),
        "total_revenue": total_revenue,
        "active_orders": active_orders,
        "delivered_orders": delivered_orders,
        "pending_payment": pending_payment,
        "recent_orders": [
            {
                "order_id": order.order_id,
                "total_price": order.total_price,
                "status": order.status,
                "created_at": order.created_at.isoformat() if order.created_at else None
            }
            for order in sorted(all_orders, key=lambda x: x.created_at or datetime.utcnow(), reverse=True)[:5]
        ]
    }

@app.put("/vendor/{vendor_id}/orders/{order_id}/status")
def update_order_status(vendor_id: int, order_id: str, new_status: str, auth_data = Depends(verify_vendor_token), db: Session = Depends(get_db)):
    """Update order status"""
    if auth_data["vendor"].id != vendor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    order = db.query(OrderModel).filter(OrderModel.order_id == order_id).first()
    if not order or order.vendor_id != vendor_id:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = new_status
    order.updated_at = datetime.utcnow()
    db.commit()
    
    if order_id in ORDERS:
        ORDERS[order_id]["status"] = new_status
    
    return {"order_id": order_id, "status": new_status, "updated_at": order.updated_at.isoformat()}

@app.put("/vendor/{vendor_id}/inventory/{product_id}")
def update_inventory(vendor_id: int, product_id: str, new_stock: int, auth_data = Depends(verify_vendor_token), db: Session = Depends(get_db)):
    """Update product stock"""
    if auth_data["vendor"].id != vendor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if not db:
        product = next((p for p in PRODUCTS if p["id"] == product_id), None)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        old_stock = product["stock"]
        product["stock"] = new_stock
        
        return {"product_id": product_id, "old_stock": old_stock, "new_stock": new_stock}
    
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product or product.vendor_id != vendor_id:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")
    
    old_stock = product.stock
    product.stock = new_stock
    
    history = InventoryHistoryModel(
        product_id=product_id,
        old_stock=old_stock,
        new_stock=new_stock,
        changed_by=vendor_id,
        reason="manual_update"
    )
    
    db.add(history)
    db.commit()
    
    product_mem = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if product_mem:
        product_mem["stock"] = new_stock
    
    return {"product_id": product_id, "old_stock": old_stock, "new_stock": new_stock}

# ============ MOCKED SERVICES ============

def _call_payment_service(order_id: str, amount: float):
    """MOCKED: Payment Service"""
    print(f"[MOCKED PAYMENT] Processing ${amount} for order {order_id}")
    if order_id in ORDERS:
        ORDERS[order_id]["payment_status"] = "completed"

def _update_inventory(items: list):
    """MOCKED: Inventory Service"""
    print(f"[MOCKED INVENTORY] Updated stock for {len(items)} items")

def _send_notification(user_id: str, message: str):
    """MOCKED: Notification Service"""
    print(f"[MOCKED NOTIFICATION] To {user_id}: {message}")

def _start_delivery(order_id: str):
    """MOCKED: Delivery Service"""
    print(f"[MOCKED DELIVERY] Started delivery for order {order_id}")
    if order_id in ORDERS:
        ORDERS[order_id]["delivery_status"] = "in_transit"

# ============ UTILITY ENDPOINTS ============

@app.get("/health")
def health():
    supabase_status = "✅ Connected" if supabase else "⚠️  Not connected"
    db_status = "✅ Connected" if engine else "⚠️  Not connected"
    return {
        "status": "ok",
        "service": "ecommerce-backend",
        "supabase": supabase_status,
        "database": db_status,
        "features": ["buyer-chat", "vendor-dashboard", "supabase-auth"]
    }

# ============ STARTUP EVENT ============

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*70)
    print("🚀 E-Commerce Multi-Vendor Backend Starting")
    print("="*70)
    print("✅ FastAPI server running on port 8001")
    if supabase:
        print("✅ Supabase auth connected")
    else:
        print("⚠️  Supabase not configured")
    if engine:
        print("✅ PostgreSQL database connected")
    else:
        print("⚠️  PostgreSQL not connected")
    print("="*70 + "\n")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)