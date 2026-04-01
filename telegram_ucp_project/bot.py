import logging
import os
import json
import httpx
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, filters

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

UCP_SERVER_URL = os.getenv("UCP_SERVER_URL", "http://127.0.0.1:8182")
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TOKEN_HERE")

# Auto-provisioned user sessions — keyed by Telegram user_id
# No manual registration required. Each Telegram user gets a unique session.
USER_SESSIONS = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Auto-provision user session on /start — zero config for end users."""
    user = update.effective_user
    user_id = str(user.id)

    # Auto-create a session for this Telegram user if they don't have one
    if user_id not in USER_SESSIONS:
        USER_SESSIONS[user_id] = {
            "cart_id": None,
            "last_search": [],
            "name": user.full_name,
        }

    await update.message.reply_text(
        f"👋 Hey {user.first_name}! Welcome to *Gaura Commerce Bot* 🛍️\n"
        f"Your session has been automatically created. No registration needed!\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "🟢 *What I can do:*\n"
        "• Just *chat naturally* — I use AI to understand you\n"
        "• `/search <item>` — Search products\n"
        "• `/cart` — View your cart\n"
        "• `/checkout` — Place your order\n"
        "• `/clear` — Clear cart\n"
        "• `add <product_id> <qty>` — Add item directly\n\n"
        "💡 *Try saying:* \"show me t-shirts\" or \"find hoodies under 500\"\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"🆔 Your session ID: `{user_id}`",
        parse_mode='Markdown'
    )

async def search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = " ".join(context.args)
    if not query:
        await update.message.reply_text("Please provide a search query.\nUsage: /search <term>\nExample: /search halwa")
        return

    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(f"{UCP_SERVER_URL}/products", params={"q": query})
            if resp.status_code == 200:
                products = resp.json().get("items", [])
                if not products:
                    await update.message.reply_text(
                        f"😕 No products found for *'{query}'*.\n\n"
                        "💡 Try: /search halwa  or  /search chips  or  /search saree",
                        parse_mode='Markdown'
                    )
                    return

                msg = f"🔎 *Search Results for '{query}':*\n\n"
                for p in products[:5]:
                    price = p.get("price", "N/A")
                    curr = p.get("currency", "INR")
                    source = "🏪" if p.get("source") == "supabase" else "🛍️"
                    msg += f"{source} `{p['id']}`\n📌 *{p['name']}*\n💰 {curr} {price}\n📦 {p.get('description', '')[:80]}\n\n"
                msg += "To buy, type: `add <id> <qty>`"
                await update.message.reply_markdown(msg)
            else:
                await update.message.reply_text(f"⚠️ Search returned error ({resp.status_code}). Try again.")
        except httpx.TimeoutException:
            await update.message.reply_text("⏱️ Search timed out. The backend may be busy. Try again shortly.")
        except Exception as e:
            logging.error(f"Search error: {e}", exc_info=True)
            await update.message.reply_text(f"❌ Search failed: {e}")


async def add_to_cart(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Use original text to preserve case for Product IDs
    text = update.message.text.strip().split()
    
    # Simple check for 'add' command case-insensitively
    if text[0].lower() != "add":
        return

    if len(text) < 3:
        await update.message.reply_text("Usage: add <product_id> <qty>")
        return
    
    product_id = text[1]
    try:
        qty = int(text[2])
    except:
        await update.message.reply_text("Quantity must be a number.")
        return

    # Verify product exists
    async with httpx.AsyncClient() as client:
        # Pass ID via query param to avoid URL path issues with GIDs
        resp = await client.get(f"{UCP_SERVER_URL}/catalog/product", params={"id": product_id})
        product = {}
        if resp.status_code == 200:
            product = resp.json() or {}
        else:
            # Fallback
            pass

    # Add to session cart
    cart = context.user_data.get("cart", [])
    
    # Check if item exists
    existing = next((item for item in cart if item["item"]["id"] == product_id), None)
    if existing:
        existing["quantity"] += qty
        # Update details if we have them now but didn't before
        if product.get("name"):
            existing["item"]["title"] = product.get("name")
        if product.get("price"):
            existing["unit_price"] = product.get("price")
    else:
        cart.append({
            "item": {
                "id": product_id,
                "title": product.get("name", "Unknown Product (Could not fetch details)")
            },
            "quantity": qty,
            "unit_price": product.get("price", 0) 
        })
    
    context.user_data["cart"] = cart
    
    item_name = product.get('name') or (existing['item']['title'] if existing else 'Item')
    await update.message.reply_text(f"✅ Added {qty} x {item_name} to cart!")

async def view_cart(update: Update, context: ContextTypes.DEFAULT_TYPE):
    cart = context.user_data.get("cart", [])
    if not cart:
        await update.message.reply_text("🛒 Your cart is empty.")
        return

    msg = "🛒 **Your Cart:**\n\n"
    total = 0
    for item in cart:
        price = item.get("unit_price", 0) * item["quantity"]
        total += price
        msg += f"- {item['item']['title']} (x{item['quantity']}) = {price}\n"
    
    msg += f"\n**Total: {total}**\n\nType /checkout to proceed."
    await update.message.reply_markdown(msg)

async def clear_cart(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["cart"] = []
    await update.message.reply_text("🗑️ Cart cleared.")

async def checkout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    cart = context.user_data.get("cart", [])
    if not cart:
        await update.message.reply_text("Cart is empty.")
        return

    await update.message.reply_text("⏳ Initiating UCP Checkout Session...")
    
    payload = {
        "line_items": [{"item": i["item"], "quantity": i["quantity"]} for i in cart],
        "buyer": {
            "full_name": update.effective_user.full_name,
            "email": "telegram_user@example.com"
        },
        "currency": "USD" # Default
    }
    
    headers = {
        "UCP-Agent": 'profile="https://agent.example/profile"',
        "Request-Signature": "test",
        "Idempotency-Key": f"txn-{update.update_id}",
        "Request-Id": f"req-{update.update_id}"
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{UCP_SERVER_URL}/checkout-sessions",
                json=payload,
                headers=headers
            )
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                checkout_id = data.get("id")
                await update.message.reply_text(f"✅ Checkout Session Created!\n🆔 Session ID: `{checkout_id}`\n\nProceeding to payment...")
                
                # Payment
                payment_payload = {
                     "id": "mock_instrument_1",
                     "type": "PAYMENT_TOKEN",
                     "token": "success_token"
                }

                complete_resp = await client.post(
                    f"{UCP_SERVER_URL}/checkout-sessions/{checkout_id}/complete",
                    json=payment_payload,
                    headers=headers
                )
                
                await update.message.reply_text("💳 Payment processed (Mock). Order Placed!")
                context.user_data["cart"] = []
            else:
                await update.message.reply_text(f"❌ Checkout failed: {resp.text}")
        except Exception as e:
            await update.message.reply_text(f"Error: {e}")


async def chat_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_msg = update.message.text
    # Ignore commands
    if user_msg.startswith('/'): return
    
    user = update.effective_user
    user_id = str(user.id)

    # Auto-provision session if user skipped /start
    if user_id not in USER_SESSIONS:
        USER_SESSIONS[user_id] = {"cart_id": None, "last_search": [], "name": user.full_name}
    
    # Send waiting action
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

    payload = {
        "message": user_msg,
        "user_id": user_id  # Unique per-Telegram-user, fully automated
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            logging.info(f"Routing to AI backend at: {UCP_SERVER_URL}/chat")
            resp = await client.post(f"{UCP_SERVER_URL}/chat", json=payload)
            if resp.status_code == 200:
                reply = resp.json().get("response", "I'm not sure how to respond.")
                await update.message.reply_markdown(reply)
            else:
                logging.error(f"Backend returned error {resp.status_code}: {resp.text}")
                await update.message.reply_text(f"⚠️ Backend error: {resp.text}")
        except httpx.ConnectError:
            logging.error(f"Could not connect to backend at {UCP_SERVER_URL}")
            await update.message.reply_text("❌ AI backend is unreachable. Please try again shortly.")
        except Exception as e:
            logging.error(f"Unexpected error in chat: {e}", exc_info=True)
            await update.message.reply_text(f"⚠️ Error: {e}")

if __name__ == '__main__':
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("search", search))
    app.add_handler(CommandHandler("cart", view_cart))
    app.add_handler(CommandHandler("clear", clear_cart))
    app.add_handler(CommandHandler("checkout", checkout))
    # Regex for case-insensitive 'add'
    app.add_handler(MessageHandler(filters.Regex(r'(?i)^add\s+'), add_to_cart))

    
    # General Chat Handler (Must be last)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND & ~filters.Regex(r'(?i)^add\s+'), chat_message))

    print(f"Bot starting... (Token: {BOT_TOKEN[:5]}...)")
    app.run_polling()
