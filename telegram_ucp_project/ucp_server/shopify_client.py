import httpx
import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load env from parent directory if needed
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))


# CONFIGURATION
# We define them here but fetch dynamically in function to be safe
SHOPIFY_STORE_DOMAIN = os.getenv("SHOPIFY_STORE_DOMAIN", "your-store.myshopify.com") 
SHOPIFY_STOREFRONT_TOKEN = os.getenv("SHOPIFY_STOREFRONT_TOKEN", "") 

async def shopify_graphql(query: str, variables: dict = None):
    """Generic helper to send GraphQL queries to Shopify Storefront API."""
    # Re-fetch in case env vars were loaded late
    token = os.getenv("SHOPIFY_STOREFRONT_TOKEN")
    domain = os.getenv("SHOPIFY_STORE_DOMAIN")
    
    if not token or not domain:
        logger.error("SHOPIFY_STOREFRONT_TOKEN or DOMAIN is missing")
        return None
        
    url = f"https://{domain}/api/2024-01/graphql.json"

    headers = {
        "X-Shopify-Storefront-Access-Token": token,
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(
                url,
                json={"query": query, "variables": variables or {}},
                headers=headers
            )
            # Log response if error for debugging
            if resp.status_code != 200:
                 logger.error(f"Shopify Error {resp.status_code}: {resp.text}")
            return resp.json()
        except Exception as e:
            logger.error(f"Shopify Request Failed: {e}")
            return None

async def search_products_in_shopify(query_term: str):
    """Search products using Shopify Storefront API."""
    
    # GraphQL Query for Products
    gql = """
    query searchProducts($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            description
            variants(first: 1) {
              edges {
                node {
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
    """
    
    response = await shopify_graphql(gql, {"query": query_term})
    
    if not response or "data" not in response:
        return []
        
    # TRANSLATION LAYER: Shopify -> UCP
    ucp_items = []
    for edge in response["data"]["products"]["edges"]:
        node = edge["node"]
        
        # safely get price
        price = 0
        currency = "USD"
        if node["variants"]["edges"]:
            price_data = node["variants"]["edges"][0]["node"]["price"]
            price = float(price_data["amount"])
            currency = price_data["currencyCode"]
            
        ucp_items.append({
            "id": node["id"],
            "name": node["title"],
            "description": node.get("description", ""),
            "price": price,
            "currency": currency,
            # "image": ... (add image mapping later)
        })
        
    return ucp_items

async def get_product_in_shopify(product_id: str):
    """Fetch a single product by ID."""
    gql = """
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        description
        variants(first: 1) {
          edges {
            node {
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
    """
    response = await shopify_graphql(gql, {"id": product_id})
    if not response or "data" not in response or not response["data"]["product"]:
        return None
        
    node = response["data"]["product"]
    
    price = 0
    currency = "USD"
    if node["variants"]["edges"]:
        price_data = node["variants"]["edges"][0]["node"]["price"]
        price = float(price_data["amount"])
        currency = price_data["currencyCode"]
        
    return {
        "id": node["id"],
        "name": node["title"],
        "title": node["title"], # Support both naming conventions
        "description": node.get("description", ""),
        "price": price,
        "currency": currency
    }
