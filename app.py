#!/usr/bin/env python3
"""
Streamlit Frontend using Claude API + Real MCP Server
"""

import streamlit as st
import asyncio
import json
import os
import re
import subprocess
import anthropic

st.set_page_config(page_title="Marketplace", page_icon="🛍️", layout="wide")
st.title("🛍️ Chat-Driven Marketplace")

# Initialize Claude
claude_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "cart_id" not in st.session_state:
    st.session_state.cart_id = None
if "order_id" not in st.session_state:
    st.session_state.order_id = None
if "last_product_id" not in st.session_state:
    st.session_state.last_product_id = "p1"
if "last_qty" not in st.session_state:
    st.session_state.last_qty = 1

def call_claude(prompt: str) -> str:
    """Call Claude"""
    try:
        message = claude_client.messages.create(
            model="claude-opus-4-1-20250805",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    except Exception as e:
        return f"Error: {e}"

def extract_tool_calls(response_text: str):
    """Extract tool calls"""
    tool_calls = []
    patterns = [
        r'<search_products>\s*({.*?})\s*</search_products>',
        r'<create_cart>\s*({.*?})\s*</create_cart>',
        r'<add_item_to_cart>\s*({.*?})\s*</add_item_to_cart>',
        r'<create_order>\s*({.*?})\s*</create_order>',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, response_text, re.DOTALL)
        for match in matches:
            try:
                tool_data = json.loads(match)
                if "tool_name" in tool_data:
                    tool_data["tool_name"] = tool_data["tool_name"].lower()
                tool_calls.append(tool_data)
            except:
                pass
    return tool_calls

# Sidebar
with st.sidebar:
    st.header("📖 How to Use")
    st.markdown("""
    1. **Search**: "I want black t-shirts, size L, under 400"
    2. **Add**: "Add to my cart"
    3. **Order**: "Place order for today 5-7pm"
    4. **Status**: "What's my order status?"
    """)
    st.divider()
    
    st.subheader("📦 Products")
    for name, price in [("Black T-Shirt", "₹299"), ("White T-Shirt", "₹399"), ("Blue Jeans", "₹799"), ("Red Hoodie", "₹599")]:
        st.caption(f"• {name} - {price}")
    
    st.divider()
    
    if st.session_state.cart_id:
        st.success(f"Cart: {st.session_state.cart_id[:12]}...")
    if st.session_state.order_id:
        st.success(f"Order: {st.session_state.order_id[:12]}...")

# Chat display
st.subheader("💬 Chat")
for message in st.session_state.messages:
    st.chat_message(message["role"]).write(message["content"])

# Input
user_input = st.chat_input("Ask about products, cart, or orders...")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    st.chat_message("user").write(user_input)
    
    with st.spinner("Processing..."):
        try:
            system_prompt = f"""You are an ecommerce assistant. Extract ALL details from user request and call tools.

CURRENT STATE:
- cart_id: {st.session_state.cart_id}
- order_id: {st.session_state.order_id}
- last_product_id: {st.session_state.last_product_id}
- last_qty: {st.session_state.last_qty}
- user_id: user-123

USER REQUEST: {user_input}

If user says "add to cart" or "proceed", use the last_product_id and last_qty from state.
If user says "add X items", use that quantity.

TOOL EXAMPLES:

"I want 2 black t-shirts, size L, under 400 from Civil Lines":
<search_products>{{"tool_name": "search_products", "arguments": {{"query": "black t-shirt", "size": "L", "max_price": 400, "location": "Civil Lines", "quantity": 2}}}}</search_products>

"Add to my cart" (use last product):
<add_item_to_cart>{{"tool_name": "add_item_to_cart", "arguments": {{"cart_id": "{st.session_state.cart_id or 'cart-123'}", "product_id": "{st.session_state.last_product_id}", "qty": {st.session_state.last_qty}}}}}</add_item_to_cart>

"Place order for today 5-7pm":
<create_order>{{"tool_name": "create_order", "arguments": {{"cart_id": "{st.session_state.cart_id or 'cart-123'}", "user_id": "user-123", "delivery_slot": "today 5-7pm"}}}}</create_order>

"What's my order status?":
<get_order_status>{{"tool_name": "get_order_status", "arguments": {{"order_id": "{st.session_state.order_id or 'order-123'}"}}}}</get_order_status>

IMPORTANT: When user says "add to cart", create cart first if needed, then add the last searched product."""
            
            full_prompt = f"{system_prompt}\n\nUser: {user_input}"
            claude_response = call_claude(full_prompt)
            
            tool_calls = extract_tool_calls(claude_response)
            
            tool_results = []
            if tool_calls:
                st.info(f"Calling {len(tool_calls)} tool(s)...")
                
                import httpx
                for call in tool_calls:
                    tool_name = call.get("tool_name", "unknown")
                    arguments = call.get("arguments", {})
                    st.caption(f"🔧 {tool_name}")
                    
                    try:
                        # Call backend directly for demo
                        if tool_name == "search_products":
                            params = {k: v for k, v in {"q": arguments.get("query"), "size": arguments.get("size"), "max_price": arguments.get("max_price"), "location": arguments.get("location")}.items() if v is not None}
                            resp = httpx.get("http://localhost:8001/catalog/search", params=params)
                            if resp.status_code == 200:
                                result = resp.json()
                                if result.get('items'):
                                    st.session_state.last_product_id = result['items'][0]['id']
                                    st.session_state.last_qty = arguments.get("quantity", 1)
                                tool_results.append({"tool": tool_name, "result": result})
                                st.caption(f"✓ Found {len(result.get('items', []))} products")
                        
                        elif tool_name == "create_cart":
                            resp = httpx.post("http://localhost:8001/cart", json={"user_id": arguments.get("user_id", "user-123")})
                            if resp.status_code == 200:
                                result = resp.json()
                                st.session_state.cart_id = result.get("cart_id")
                                tool_results.append({"tool": tool_name, "result": result})
                                st.caption(f"✓ Cart created: {result.get('cart_id', 'unknown')[:12]}...")
                        
                        elif tool_name == "add_item_to_cart":
                            cart_id = arguments.get("cart_id") or st.session_state.cart_id
                            resp = httpx.post(f"http://localhost:8001/cart/{cart_id}/items", json={"cart_id": cart_id, "product_id": arguments.get("product_id", "p1"), "qty": arguments.get("qty", 1)})
                            if resp.status_code == 200:
                                tool_results.append({"tool": tool_name, "result": resp.json()})
                                st.caption(f"✓ Added to cart")
                        
                        elif tool_name == "create_order":
                            cart_id = arguments.get("cart_id") or st.session_state.cart_id
                            resp = httpx.post("http://localhost:8001/order", json={"cart_id": cart_id, "user_id": arguments.get("user_id", "user-123"), "delivery_slot": arguments.get("delivery_slot", "today 5-7pm")})
                            if resp.status_code == 200:
                                result = resp.json()
                                st.session_state.order_id = result.get("order_id")
                                tool_results.append({"tool": tool_name, "result": result})
                                st.caption(f"✓ Order placed: {result.get('order_id', 'unknown')[:12]}...")
                        
                        elif tool_name == "get_order_status":
                            resp = httpx.get(f"http://localhost:8001/order/{arguments.get('order_id')}")
                            if resp.status_code == 200:
                                tool_results.append({"tool": tool_name, "result": resp.json()})
                                st.caption(f"✓ Got order status")
                    
                    except Exception as e:
                        st.error(f"Error calling {tool_name}: {e}")
            
            # Now respond with tool results
            if tool_results:
                results_text = "\n".join([f"{r['tool']}: {json.dumps(r['result'], indent=2)[:200]}" for r in tool_results])
                response_prompt = f"User asked: {user_input}\n\nTool results:\n{results_text}\n\nRespond naturally about these results (2-3 sentences)."
            else:
                response_prompt = f"User: {user_input}\nRespond naturally (1-2 sentences)."
            
            response_text = call_claude(response_prompt)
            
            st.session_state.messages.append({"role": "assistant", "content": response_text})
            st.chat_message("assistant").write(response_text)
        
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            st.error(error_msg)
            st.session_state.messages.append({"role": "assistant", "content": error_msg})

st.divider()
st.caption("🚀 Claude + Real MCP Server")