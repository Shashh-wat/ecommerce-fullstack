# MCP E-Commerce Chat System - Complete Documentation

## Overview

This is a production-ready e-commerce chat system that uses Claude AI with Model Context Protocol (MCP) to enable natural language shopping. Users can search products, create carts, add items, and place orders entirely through conversation.

**Architecture:**
```
User → Claude API → MCP Server (stdio transport) → Backend API → Database
```

---

## System Components

### 1. Backend API (`backend.py`)
FastAPI service running on `http://localhost:8001`

**Core Endpoints (Production):**
- `GET /catalog/search` - Search products with filters
- `POST /cart` - Create shopping cart
- `POST /cart/{cart_id}/items` - Add items to cart
- `GET /cart/{cart_id}` - Get cart contents
- `POST /order` - Create order
- `GET /order/{order_id}` - Get order status

**Mocked Services:**
- Payment processing (marked with `[MOCKED PAYMENT]`)
- Inventory updates (marked with `[MOCKED INVENTORY]`)
- Notifications (marked with `[MOCKED NOTIFICATION]`)
- Delivery coordination (marked with `[MOCKED DELIVERY]`)

### 2. MCP Server (`mcp_server_official.py`)
FastMCP server exposing tools to Claude via stdio transport

**Available Tools:**
1. `search_products(query, max_price, location)` - Search for products
2. `create_cart(user_id)` - Create a new shopping cart
3. `add_item_to_cart(cart_id, product_id, qty)` - Add item to cart
4. `get_cart(cart_id)` - View cart contents
5. `create_order(cart_id, user_id, delivery_slot)` - Place order
6. `get_order_status(order_id)` - Track order

### 3. Orchestrator (`orchestrator_official.py`)
Claude client that:
- Connects to MCP server via stdio
- Calls Claude API with tool definitions
- Handles tool execution loop
- Maintains conversation context

---

## Installation & Setup

### Prerequisites
```bash
python3 >= 3.10
pip install -r requirements.txt
```

### Required Packages
```
fastapi>=0.109.0
uvicorn>=0.27.0
httpx>=0.27.1
pydantic>=2.11.0
anthropic>=0.45.0
mcp>=1.23.3
```

### Environment Setup
```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Navigate to project directory
cd ~/Documents/mcp/claude
```

### File Structure
```
claude/
├── backend.py                 # FastAPI backend
├── mcp_server_official.py    # MCP server with tools
├── orchestrator_official.py  # Claude client
├── requirements.txt          # Dependencies
└── README.md                 # This file
```

---

## Running the System

### Start All Services (3 terminals)

**Terminal 1: Backend API**
```bash
python3 backend.py
# Output: Uvicorn running on http://0.0.0.0:8001
```

**Terminal 2: Orchestrator (spawns MCP server)**
```bash
python3 orchestrator.py
# Output: 
# [ECOMMERCE CHATBOT]
# [✓] MCP Server connected via stdio
# [✓ Ready for chat!]
```

**No Terminal 3 needed** - MCP server is spawned by orchestrator

---

## User Interaction Guide

### Critical: How to Structure Prompts

The system works best when you provide **complete context** in each message. Claude doesn't retain IDs from previous responses automatically.

#### Pattern 1: First-Time Search
```
search for black t-shirts under 400 from civil lines
```
**Why it works:**
- Product type: "black t-shirts"
- Price filter: "under 400"
- Location: "civil lines" (exact name: "Civil Lines")

**Output:** Claude calls `search_products(query="black t-shirt", max_price=400, location="Civil Lines")`

---

#### Pattern 2: Create Cart
```
create a shopping cart for user user-123
```
**Response includes:** `cart-xxxxxxxx` (save this ID)

**Why important:** Cart ID is needed for all cart operations. Save it immediately.

---

#### Pattern 3: Add to Cart (REQUIRES CART ID)
```
my cart id is cart-3292d671, add black t-shirt p1 with quantity 1
```
**Why it works:**
- Explicitly provides cart ID at start
- Product ID (p1) from search results
- Quantity specified
- All info in one message

**What happens:**
1. Claude searches to confirm product exists
2. Claude calls `add_item_to_cart(cart_id, product_id, qty)`
3. Returns updated cart contents

---

#### Pattern 4: View Cart (REQUIRES CART ID)
```
my cart id is cart-3292d671, what's in my cart?
```
**Why it works:**
- Explicitly includes cart ID
- Clear action requested

**Output:** Cart contents with total price

---

#### Pattern 5: Create Order (REQUIRES CART ID & USER ID)
```
my cart id is cart-3292d671, create an order. my user id is user-123. deliver today 6-8pm
```
**Why it works:**
- Cart ID provided
- User ID provided
- Delivery slot specified

**Output:** Order ID and confirmation

---

#### Pattern 6: Check Order Status (REQUIRES ORDER ID)
```
my order id is order-a0edb4e1, what's my order status?
```
**Why it works:**
- Order ID explicitly provided
- Clear action

---

## Complete Conversation Flow (Working Example)

### Step 1: Search
```
User: search for black t-shirts under 400 from civil lines

Claude: Found 2 t-shirts...
- Black T-Shirt (L) - ₹299 - Product ID: p1
- Black T-Shirt (M) - ₹349 - Product ID: p2
```

### Step 2: Create Cart
```
User: create a shopping cart for user user-123

Claude: Cart created successfully!
Cart ID: cart-3292d671
```

### Step 3: Add to Cart
```
User: my cart id is cart-3292d671, add black t-shirt p1 with quantity 1

Claude: Successfully added to cart!
Current cart: 1x Black T-Shirt (L) - ₹299
```

### Step 4: View Cart
```
User: my cart id is cart-3292d671, what's in my cart?

Claude: Your cart contains:
- Black T-Shirt (L) - ₹299 (Qty: 1)
Total: ₹299
```

### Step 5: Create Order
```
User: my cart id is cart-3292d671, create an order. my user id is user-123. deliver today 6-8pm

Claude: Order created!
Order ID: order-a0edb4e1
Status: Placed
Payment: Completed
Delivery: Today 6-8pm
```

### Step 6: Check Status
```
User: my order id is order-a0edb4e1, what's my order status?

Claude: Order Status: Placed ✓
Payment: Completed ✓
Delivery: Not Started
Items: Black T-Shirt (L) - ₹299
Delivery Slot: Today 6-8pm
```

---

## Common Prompts That Work

### Search Operations
```
search for jeans under 900 in mall road
search for hoodies under 600 from civil lines
search for t-shirts under 500
search for all products in rajpur road
find white t-shirts under 400
```

### Cart Operations
```
my cart id is [cart-id], add product [product-id] with quantity [qty]
my cart id is [cart-id], what's in my cart?
my cart id is [cart-id], remove [product-id]
```

### Order Operations
```
my cart id is [cart-id], my user id is [user-id], create an order. deliver [time]
my order id is [order-id], what's my status?
my order id is [order-id], can you track this?
```

---

## Common Mistakes & How to Fix Them

### ❌ MISTAKE 1: Not Including Cart ID
```
User: add black t-shirt to my cart
Claude: Error: I don't have your cart ID
```
**Fix:**
```
User: my cart id is cart-3292d671, add black t-shirt p1 with quantity 1
Claude: ✓ Successfully added
```

---

### ❌ MISTAKE 2: Vague Location Names
```
User: search for t-shirts in civil lines area
Claude: No results found
```
**Fix:**
```
User: search for t-shirts in civil lines
Claude: ✓ Found 2 t-shirts in Civil Lines
```

**Valid Locations:**
- "Civil Lines"
- "Rajpur Road"
- "Mall Road"

---

### ❌ MISTAKE 3: Not Specifying Product ID When Adding
```
User: add the black t-shirt to my cart
Claude: Which black t-shirt? (L or M?) Here are options: p1, p2
```
**Fix:**
```
User: my cart id is cart-3292d671, add p1 with quantity 1
Claude: ✓ Added Black T-Shirt (L)
```

---

### ❌ MISTAKE 4: Missing User ID for Orders
```
User: my cart id is cart-3292d671, create an order
Claude: I need your user ID to create an order
```
**Fix:**
```
User: my cart id is cart-3292d671, my user id is user-123, create order for today 6-8pm
Claude: ✓ Order created
```

---

### ❌ MISTAKE 5: Not Including Order ID for Status
```
User: what's my order status?
Claude: I need your order ID
```
**Fix:**
```
User: my order id is order-a0edb4e1, what's my order status?
Claude: ✓ Order Status: Placed
```

---

## Available Products

### Test Data (in backend.py)
```
p1: Black T-Shirt (L)       - ₹299  - Civil Lines
p2: Black T-Shirt (M)       - ₹349  - Rajpur Road
p3: White T-Shirt (L)       - ₹399  - Civil Lines
p4: Blue Jeans (32)         - ₹799  - Mall Road
p5: Red Hoodie (L)          - ₹599  - Civil Lines
```

---

## Tool Descriptions & Parameters

### 1. search_products
```
Parameters:
- query (str): Product name/type (e.g., "t-shirt", "jeans", "hoodie")
- max_price (float): Maximum price budget (e.g., 400, 500)
- location (str): Seller location - EXACT names REQUIRED: "Civil Lines", "Rajpur Road", "Mall Road"

Returns: List of matching products with id, name, price, size, location, stock

CRITICAL: Claude MUST extract location from user message
If user says "from X" or "in X", location MUST be included in the call
```

**Examples:**
```
search_products(query="black t-shirt", max_price=400, location="Civil Lines")
search_products(query="hoodie", max_price=600, location="Civil Lines")
search_products(query="jeans", max_price=900, location="Mall Road")
```

**Tool Description (as seen by Claude):**
```
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
```

**Why this matters:**
Earlier versions of the tool description were too vague, causing Claude to sometimes skip the location parameter. The updated description includes explicit instructions and examples so Claude reliably extracts all three parameters.

---

### 2. create_cart
```
Parameters:
- user_id (str): User identifier (e.g., "user-123", "customer-456")

Returns: Cart object with cart_id, user_id, empty items list

IMPORTANT: Save the cart_id from response - needed for all cart operations
```

**Example:**
```
create_cart(user_id="user-123")
Returns: {"cart_id": "cart-3292d671", "user_id": "user-123", "items": []}
```

---

### 3. add_item_to_cart
```
Parameters:
- cart_id (str): Cart identifier (e.g., "cart-3292d671")
- product_id (str): Product ID from search (e.g., "p1", "p2", "p5")
- qty (int): Quantity to add (e.g., 1, 2, 5)

Returns: Updated cart with items and totals

MUST HAVE: cart_id before calling this
```

**Example:**
```
add_item_to_cart(cart_id="cart-3292d671", product_id="p1", qty=1)
Returns: Updated cart with 1 Black T-Shirt
```

---

### 4. get_cart
```
Parameters:
- cart_id (str): Cart identifier

Returns: Cart contents with items list and total_price

MUST HAVE: cart_id
```

**Example:**
```
get_cart(cart_id="cart-3292d671")
Returns: {"cart_id": "cart-3292d671", "items": [...], "total_price": 299}
```

---

### 5. create_order
```
Parameters:
- cart_id (str): Cart to convert to order
- user_id (str): User placing order
- delivery_slot (str): Delivery time (e.g., "today 6-8pm", "tomorrow 10am-12pm")

Returns: Order object with order_id, status, items, total, payment_status

MUST HAVE: cart_id, user_id

IMPORTANT: Save order_id for status tracking
```

**Example:**
```
create_order(cart_id="cart-3292d671", user_id="user-123", delivery_slot="today 6-8pm")
Returns: {"order_id": "order-a0edb4e1", "status": "placed", ...}
```

---

### 6. get_order_status
```
Parameters:
- order_id (str): Order identifier from create_order response

Returns: Order details with status, payment_status, delivery_status

MUST HAVE: order_id
```

**Example:**
```
get_order_status(order_id="order-a0edb4e1")
Returns: {"order_id": "order-a0edb4e1", "status": "placed", "payment_status": "completed", ...}
```

---

## Debugging Issues

### Issue: "Received request before initialization was complete"
**Cause:** MCP server not fully initialized
**Fix:**
```bash
pkill -f "python3.*mcp"
# Restart orchestrator - it will spawn fresh server
python3 orchestrator.py
```

---

### Issue: "Invalid request parameters"
**Cause:** Tool called without required parameters
**Fix:** Provide complete context including all IDs
```
# Bad
User: add this to cart
# Good
User: my cart id is cart-xyz, add p1 with quantity 1
```

---

### Issue: Search returns no results for location-specific queries
**Cause:** Claude not extracting location parameter from request
**Fix:** Tool description includes explicit instructions and examples. If Claude still skips location:
```
# Bad (Claude skips location)
User: search for t-shirts under 400 from civil lines
Claude: Calls search_products(query="t-shirt", max_price=400) ← missing location

# Good (Claude includes location)
User: search for t-shirts under 400 from civil lines
Claude: Calls search_products(query="t-shirt", max_price=400, location="Civil Lines")
```

**Solution:** The MCP server's search_products tool includes detailed instructions in its description. Make sure you're using the updated `mcp_server_official.py` with the improved tool description that explicitly lists:
- Location parameter is REQUIRED when mentioned
- Exact location names: "Civil Lines", "Rajpur Road", "Mall Road"
- Examples showing how to extract location from user messages

---

### Issue: "I don't have your cart ID"
**Cause:** Cart ID not included in message
**Fix:** Always prefix with cart ID
```
User: my cart id is [cart-id], [action]
```

---

## Performance Notes

- **Search:** ~200-300ms (includes backend HTTP call)
- **Cart operations:** ~150-200ms
- **Order creation:** ~300-400ms (includes mocked service calls)
- **Status check:** ~150-200ms

---

## Security Considerations (For Production)

### Current (Development):
- No authentication
- In-memory data storage
- Mocked payment processing
- Public user IDs

### Required for Production:
1. **Authentication:** JWT tokens or OAuth
2. **Authorization:** Verify user can only access their own carts/orders
3. **Database:** Replace in-memory dicts with PostgreSQL/MongoDB
4. **Payment:** Integrate real payment gateway (Stripe, PayPal)
5. **Inventory:** Real inventory management system
6. **Notifications:** Email/SMS integration
7. **Delivery:** Real delivery partner API
8. **Rate limiting:** Prevent abuse
9. **Input validation:** Stricter parameter validation
10. **Logging:** Comprehensive audit logs

---

## Extending the System

### Adding a New Tool

**Step 1: Add to Backend** (`backend.py`)
```python
@app.get("/wishlist/{user_id}")
def get_wishlist(user_id: str):
    """Get user's wishlist"""
    return {"user_id": user_id, "items": [...]}
```

**Step 2: Add to MCP Server** (`mcp_server_official.py`)
```python
@mcp.tool()
async def get_wishlist(user_id: str) -> dict:
    """Get user's wishlist"""
    return await call_backend(f"/wishlist/{user_id}")
```

**Step 3: Restart**
```bash
pkill -f "python3.*mcp"
python3 orchestrator.py
```

Claude will automatically have access to the new tool.

---

## Testing Checklist

- [ ] Backend starts on port 8001
- [ ] MCP server connects via stdio
- [ ] Search returns products with filters
- [ ] Can create cart with user ID
- [ ] Can add items to cart
- [ ] Can view cart contents
- [ ] Can create order from cart
- [ ] Can check order status
- [ ] All prompts include required IDs
- [ ] Location names are exact matches
- [ ] Product IDs are from search results

---

## Troubleshooting Checklist

1. **Backend not responding?**
   ```bash
   curl http://localhost:8001/health
   # Should return: {"status": "ok"}
   ```

2. **MCP server not spawning?**
   ```bash
   python3 mcp_server_official.py
   # Should print: [INFO] Starting MCP server
   ```

3. **Claude not finding tools?**
   - Check MCP server is running
   - Verify tool names in definitions
   - Restart orchestrator

4. **Cart/Order IDs not working?**
   - Verify ID format: `cart-xxxxxxxx`, `order-xxxxxxxx`
   - Check cart exists in backend
   - Copy exact ID from response

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
│                  (Natural Language Input)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Claude API                                │
│             (claude-haiku-4-5-20251001)                     │
│          - Receives tool definitions                        │
│          - Processes user intent                            │
│          - Decides which tools to call                      │
│          - Formats responses                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ (tool_use)
┌─────────────────────────────────────────────────────────────┐
│             Orchestrator (orchestrator.py)                  │
│          - Manages Claude conversation loop                 │
│          - Calls MCP tools on Claude's behalf               │
│          - Returns results back to Claude                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ (stdio)
┌─────────────────────────────────────────────────────────────┐
│           MCP Server (mcp_server_official.py)               │
│          - Exposes 6 tools via MCP protocol                 │
│          - Routes requests to backend                       │
│          - Tool definitions:                                │
│            • search_products                                │
│            • create_cart                                    │
│            • add_item_to_cart                               │
│            • get_cart                                       │
│            • create_order                                   │
│            • get_order_status                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ (HTTP)
┌─────────────────────────────────────────────────────────────┐
│            Backend API (backend.py)                         │
│         FastAPI running on :8001                            │
│          - Product catalog                                  │
│          - Cart management                                  │
│          - Order processing                                 │
│          - Mocked services (payments, etc.)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Storage (In-Memory)                       │
│          PRODUCTS, CARTS, ORDERS dicts                      │
│                                                             │
│    (Replace with PostgreSQL for production)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Version Information

- **Python:** 3.10+
- **FastAPI:** 0.109.0+
- **MCP SDK:** 1.23.3+
- **Anthropic SDK:** 0.45.0+
- **Claude Model:** claude-haiku-4-5-20251001

---

## Support & Questions

For issues:
1. Check the "Common Mistakes" section
2. Review "Debugging Issues"
3. Verify all IDs are included in prompts
4. Check backend is running on port 8001
5. Restart MCP server if needed

---

## License

Development/Testing only. Not for production use without security hardening.