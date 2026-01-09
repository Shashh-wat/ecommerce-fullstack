#!/usr/bin/env python3
"""
Official FastMCP Server Pattern
Based on: https://github.com/modelcontextprotocol/python-sdk
"""
from mcp.server.fastmcp import FastMCP
import httpx
import json

BACKEND_URL = "http://localhost:8001"
mcp = FastMCP("ecommerce-marketplace")

async def call_backend(endpoint: str, method: str = "GET", data: dict = None, params: dict = None):
    """Call backend API"""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            if method == "GET":
                resp = await client.get(f"{BACKEND_URL}{endpoint}", params=params)
            else:
                resp = await client.post(f"{BACKEND_URL}{endpoint}", json=data)
            if resp.status_code >= 400:
                return {"error": f"Backend error: {resp.text}"}
            return resp.json()
        except Exception as e:
            return {"error": str(e)}

@mcp.tool()
async def search_products(query: str = None, max_price: float = None, location: str = None) -> dict:
    """
    Search for products in the catalog.
    
    IMPORTANT: Always extract ALL three parameters from the user's request:
    - query: What product they're looking for (e.g., "t-shirt", "jeans", "hoodie")
    - max_price: Their budget limit (e.g., 400, 500)
    - location: EXACT seller location name - MUST be one of: "Civil Lines", "Rajpur Road", "Mall Road"
    
    If user mentions location, you MUST include it in the call.
    If user says "from X" or "in X", extract X as the location.
    Examples:
    - "black t-shirts under 400 from civil lines" → query="black t-shirt", max_price=400, location="Civil Lines"
    - "jeans in mall road under 900" → query="jeans", max_price=900, location="Mall Road"
    - "hoodies from rajpur road" → query="hoodie", location="Rajpur Road"
    """
    params = {k: v for k, v in {"q": query, "max_price": max_price, "location": location}.items() if v is not None}
    return await call_backend("/catalog/search", params=params)

@mcp.tool()
async def create_cart(user_id: str) -> dict:
    """Create a new shopping cart for a user"""
    return await call_backend("/cart", "POST", {"user_id": user_id})

@mcp.tool()
async def add_item_to_cart(cart_id: str, product_id: str, qty: int) -> dict:
    """Add an item to the shopping cart"""
    return await call_backend(
        f"/cart/{cart_id}/items",
        "POST",
        {"cart_id": cart_id, "product_id": product_id, "qty": qty}
    )

@mcp.tool()
async def create_order(cart_id: str, user_id: str, delivery_slot: str = "today 5-7pm") -> dict:
    """Create an order from a cart"""
    return await call_backend(
        "/order",
        "POST",
        {"cart_id": cart_id, "user_id": user_id, "delivery_slot": delivery_slot}
    )

@mcp.tool()
async def get_cart(cart_id: str) -> dict:
    """Get the contents of a shopping cart"""
    return await call_backend(f"/cart/{cart_id}")

@mcp.tool()
async def get_order_status(order_id: str) -> dict:
    """Get the status of an order"""
    return await call_backend(f"/order/{order_id}")

if __name__ == "__main__":
    mcp.run()