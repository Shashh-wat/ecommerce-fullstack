import httpx
import asyncio

async def test():
    print("Testing Shopify Search...")
    from ucp_server.shopify_client import search_products_in_shopify
    try:
        res = await asyncio.wait_for(search_products_in_shopify("Almond"), timeout=15)
        print(f"Shopify Results: {len(res)}")
    except Exception as e:
        print(f"Shopify failed/timed out: {e}")

    print("Testing Backend Search...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get("http://localhost:8182/products?q=Almond", timeout=20.0)
            print(f"Backend Status: {resp.status_code}")
            print(f"Backend Body: {resp.text}")
        except Exception as e:
            print(f"Backend Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test())
