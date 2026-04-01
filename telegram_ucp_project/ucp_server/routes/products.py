import sys
import os

# Add parent directory to path to ensure modules are found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import db
from dependencies import get_products_db
from supabase_client import supabase
from shopify_client import search_products_in_shopify, get_product_in_shopify, SHOPIFY_STOREFRONT_TOKEN, SHOPIFY_STORE_DOMAIN

router = APIRouter()

@router.get("/products")
async def search_products(q: str = None, session: AsyncSession = Depends(get_products_db)):
    """
    Search products.
    
    PRIMARY SOURCE: Shopify Storefront API
    SECONDARY: Supabase (Legacy/Backup)
    """
    
    # 1. PRIMARY: SHOPIFY
    # This is the main workflow as requested.
    if SHOPIFY_STOREFRONT_TOKEN and SHOPIFY_STORE_DOMAIN:
        try:
            shopify_items = await search_products_in_shopify(q or "")
            if shopify_items:
                 # Return in the format UCP/Telegram Bot expects
                 return {"items": shopify_items}
        except Exception as e:
            print(f"Shopify Error: {e}")
            # Fallthrough to backup if desired, or return error

    # 2. SECONDARY: SUPABASE (Backup)
    if supabase:
        try:
            query = supabase.table("products").select("*")
            if q:
                query = query.ilike("name", f"%{q}%")
            resp = query.execute()
            items = []
            if resp.data:
                for d in resp.data:
                    items.append({
                        "id": d["id"],
                        "name": d["name"],
                        "description": d["description"],
                        "price": float(d["price"]), 
                        "stock": d["stock"]
                    })
            return {"items": items}
        except Exception:
            pass 

    return {"items": []}

@router.get("/products/{product_id:path}")
async def get_product_detail(product_id: str, session: AsyncSession = Depends(get_products_db)):
    """Get product details."""
    
    # 1. Try Shopify
    if SHOPIFY_STOREFRONT_TOKEN:
        try:
             # Product IDs from Shopify often come as URIs or Base64. 
             # Our client helper expects the raw ID or URI.
             p = await get_product_in_shopify(product_id)
             if p:
                 return p
        except Exception:
            pass

    # 2. Fallback to DB
    product = await db.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "id": product.id,
        "name": product.title,
        "price": product.price,
        "description": "Product Description"
    }
