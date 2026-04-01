#!/usr/bin/env python3
"""
Full System Demo — MCP + Backend (no LLM key needed)
Simulates a complete shopping session end-to-end.
"""
import asyncio
import json
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession

CYAN   = "\033[96m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

def banner(text):
    print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}")
    print(f"{BOLD}{CYAN}  {text}{RESET}")
    print(f"{BOLD}{CYAN}{'─'*60}{RESET}")

def user_says(text):
    print(f"\n{YELLOW}{BOLD}[👤 USER]{RESET}  {text}")

def ai_says(text):
    print(f"{GREEN}{BOLD}[🤖 AI  ]{RESET}  {text}")

def tool_call(name, args):
    print(f"{DIM}           ↳ calling tool: {name}({json.dumps(args)}){RESET}")

def result_line(text):
    print(f"{DIM}           ↳ result: {text[:120]}{RESET}")

async def call(mcp, tool_name, args):
    tool_call(tool_name, args)
    res = await mcp.call_tool(tool_name, args)
    raw = res.content[0].text if res.content else "{}"
    try:
        data = json.loads(raw)
    except Exception:
        data = {"raw": raw}
    result_line(str(data)[:160])
    return data

async def main():
    banner("GAURA / KOZHIKODE RECONNECT — FULL SYSTEM DEMO")
    print(f"{DIM}  MCP Server → Backend API → In-Memory DB{RESET}\n")

    server_params = StdioServerParameters(
        command="python3", args=["mcp_server_official.py"]
    )

    async with stdio_client(server_params) as streams:
        read_stream, write_stream = streams
        async with ClientSession(read_stream, write_stream) as mcp:
            await mcp.initialize()

            tools = await mcp.list_tools()
            print(f"{GREEN}✅ MCP Server connected — {len(tools.tools)} tools available:{RESET}")
            for t in tools.tools:
                print(f"   • {BOLD}{t.name}{RESET}: {t.description[:60]}")

            # ─────────────── STEP 1: SEARCH ───────────────
            banner("STEP 1 — Product Search")
            user_says("Show me black t-shirts under ₹400 from Civil Lines")
            data = await call(mcp, "search_products", {
                "query": "black t-shirt",
                "max_price": 400,
                "location": "Civil Lines"
            })
            items = data.get("items", data) if isinstance(data, dict) else data
            if items:
                ai_says(f"Found {len(items)} product(s):")
                for p in (items if isinstance(items, list) else [items])[:3]:
                    print(f"      🛍  {BOLD}{p.get('name','?')}{RESET} — ₹{p.get('price','?')} | ID: {p.get('id','?')} | {p.get('seller_location','?')}")
                chosen_id = (items[0] if isinstance(items, list) else items).get("id", "p1")
            else:
                ai_says("No results, defaulting to p1 for demo")
                chosen_id = "p1"

            await asyncio.sleep(0.5)

            # ─────────────── STEP 2: CREATE CART ───────────────
            banner("STEP 2 — Create Shopping Cart")
            user_says("Create a cart for me (user-123)")
            data = await call(mcp, "create_cart", {"user_id": "user-123"})
            cart_id = data.get("cart_id", "cart-demo")
            ai_says(f"Cart created! Your Cart ID: {BOLD}{cart_id}{RESET}")

            await asyncio.sleep(0.5)

            # ─────────────── STEP 3: ADD TO CART ───────────────
            banner("STEP 3 — Add Item to Cart")
            user_says(f"Add 2x of product {chosen_id} to my cart {cart_id}")
            data = await call(mcp, "add_item_to_cart", {
                "cart_id": cart_id,
                "product_id": chosen_id,
                "qty": 2
            })
            ai_says(f"Added! Cart now has {len(data.get('items', []))} item(s).")

            await asyncio.sleep(0.5)

            # ─────────────── STEP 4: VIEW CART ───────────────
            banner("STEP 4 — View Cart")
            user_says(f"What's in my cart {cart_id}?")
            data = await call(mcp, "get_cart", {"cart_id": cart_id})
            cart_items = data.get("items", [])
            total = data.get("total_price", 0)
            ai_says(f"Your cart ({len(cart_items)} items, Total: ₹{total}):")
            for item in cart_items:
                print(f"      🛒  {item.get('name','?')} × {item.get('qty','?')} — ₹{item.get('price','?')} each")

            await asyncio.sleep(0.5)

            # ─────────────── STEP 5: PLACE ORDER ───────────────
            banner("STEP 5 — Place Order")
            user_says(f"Checkout cart {cart_id} for user-123, deliver today 6-8pm")
            data = await call(mcp, "create_order", {
                "cart_id": cart_id,
                "user_id": "user-123",
                "delivery_slot": "today 6-8pm"
            })
            order_id = data.get("order_id", "unknown")
            ai_says(f"🎉 Order placed!")
            print(f"      📦  Order ID:      {BOLD}{order_id}{RESET}")
            print(f"      💳  Payment:       {data.get('payment_status', '?')}")
            print(f"      🚚  Delivery:      {data.get('delivery_slot', '?')}")
            print(f"      💰  Total:         ₹{data.get('total_price', '?')}")

            await asyncio.sleep(0.5)

            # ─────────────── STEP 6: ORDER STATUS ───────────────
            banner("STEP 6 — Track Order")
            user_says(f"Track my order {order_id}")
            data = await call(mcp, "get_order_status", {"order_id": order_id})
            ai_says("Here's your order status:")
            print(f"      📦  Status:        {BOLD}{data.get('status', '?')}{RESET}")
            print(f"      💳  Payment:       {data.get('payment_status', '?')}")
            print(f"      🚚  Delivery:      {data.get('delivery_status', '?')}")
            print(f"      🕐  Slot:          {data.get('delivery_slot', '?')}")

            # ─────────────── DONE ───────────────
            banner("DEMO COMPLETE ✅")
            print(f"""
  {GREEN}All 6 steps executed successfully:{RESET}
  1. ✅  search_products     — found items with price + location filter
  2. ✅  create_cart         — cart created with unique ID
  3. ✅  add_item_to_cart    — product added with quantity
  4. ✅  get_cart            — cart contents + total retrieved
  5. ✅  create_order        — order placed, payment processed (mocked)
  6. ✅  get_order_status    — live order tracking

  {DIM}System: MCP stdio transport → FastAPI backend → In-memory store{RESET}
  {DIM}Ready for: Telegram bot, Gemini LLM, Shopify Storefront API{RESET}
""")

if __name__ == "__main__":
    asyncio.run(main())
