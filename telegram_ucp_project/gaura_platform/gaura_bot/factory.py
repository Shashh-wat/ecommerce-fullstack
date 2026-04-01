import logging
import asyncio
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler
import httpx
from typing import Dict, Optional

# Shared config
from gaura_platform.config.schema import BotInstanceConfig

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GauraBotInstance:
    """A single bot instance belonging to a specific user"""
    def __init__(self, config: BotInstanceConfig, hub_url: str):
        self.config = config
        self.hub_url = hub_url
        self.application = Application.builder().token(config.bot_token).build()
        self._setup_handlers()

    def _setup_handlers(self):
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("search", self.search))
        self.application.add_handler(CallbackQueryHandler(self.handle_callback, pattern="^view_report:"))
        self.application.add_handler(CallbackQueryHandler(self.handle_purchase, pattern="^buy:"))
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_chat))

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            f"Hello! I am {self.config.bot_name}, your personal GAURA AI assistant.\n"
            "I connect directly to vendor devices to fetch verified data."
        )

    async def search(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        query = " ".join(context.args)
        if not query:
            await update.message.reply_text("Please provide a search term. Example: /search milk")
            return

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.hub_url}/search", params={"query": query})
                items = response.json()
            except Exception as e:
                await update.message.reply_text("⚠️ Could not reach Hub registry.")
                return

        if not items:
            await update.message.reply_text(f"No results found for '{query}'.")
            return

        for item in items:
            callback_data = f"view_report:{item['node_id']}:{item['id']}"
            keyboard = [[InlineKeyboardButton("📑 View Official AI Report", callback_data=callback_data)]]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                f"📦 *{item['name']}*\nPrice: ${item['base_price']}\n"
                f"Source: Verified Mobile Node {item['node_id']}",
                parse_mode='Markdown',
                reply_markup=reply_markup
            )

    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        query = update.callback_query
        await query.answer()
        
        _, node_id, product_id = query.data.split(":")
        await query.edit_message_text(text="⏳ Relaying request to vendor's phone...")

        async with httpx.AsyncClient() as client:
            relay_payload = {
                "target_node_id": node_id,
                "action": "get_tech_report",
                "payload": {"product_id": product_id}
            }
            try:
                response = await client.post(f"{self.hub_url}/relay_request", json=relay_payload)
                result = response.json()
                
                if result.get("status") == "success":
                    report_text = result["data"]["report"]
                    
                    # Add Purchase Button after reading report
                    kb = [[InlineKeyboardButton(f"🛒 Purchase for ${result['data'].get('price', '??')}", 
                                               callback_data=f"buy:{node_id}:{product_id}")]]
                    
                    await query.message.reply_text(
                        f"✅ *AI Technical Report Received:*\n\n{report_text[:1000]}...", 
                        parse_mode='Markdown',
                        reply_markup=InlineKeyboardMarkup(kb)
                    )
                else:
                    await query.edit_message_text(text=f"❌ Error: {result.get('message')}")
            except Exception as e:
                await query.edit_message_text(text=f"❌ Network Error: Could not reach phone node.")

    async def handle_purchase(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Processes the actual Buy button"""
        query = update.callback_query
        await query.answer()
        
        _, node_id, product_id = query.data.split(":")
        await query.edit_message_text(text="💸 Initiating Secure Transaction via UCP Relay...")

        async with httpx.AsyncClient() as client:
            order_payload = {
                "target_node_id": node_id,
                "action": "create_order",
                "payload": {
                    "buyer_id": f"tg_{update.effective_user.id}",
                    "items": [{"product_id": product_id, "quantity": 1}]
                }
            }
            try:
                response = await client.post(f"{self.hub_url}/relay_request", json=order_payload)
                result = response.json()
                
                if result.get("status") == "success":
                    order = result["data"]
                    await query.message.reply_text(
                        f"🎉 *Order Created!*\nID: `{order['id']}`\n"
                        "🔗 *Fetching UPI Payment Details...*",
                        parse_mode='Markdown'
                    )
                    
                    # 2. Get UPI Details from Hub
                    async with httpx.AsyncClient() as client_pay:
                        pay_res = await client_pay.post(
                            f"{self.hub_url}/process_payment",
                            params={
                                "order_id": order['id'],
                                "vendor_node_id": node_id,
                                "amount": order['total_amount']
                            }
                        )
                        pay_result = pay_res.json()
                        
                        if pay_result.get("status") == "success":
                            # Standard UPI Deep link for button, but also show ID for manual pay
                            upi_id = pay_result['upi_id']
                            upi_link = pay_result['upi_link']
                            
                            kb = [[InlineKeyboardButton("📱 Pay via UPI App", url=upi_link)]]
                            
                            await query.message.reply_text(
                                f"💸 *Pay Directly to Seller:*\n\n"
                                f"Amount: `${order['total_amount']}`\n"
                                f"UPI ID: `{upi_id}`\n\n"
                                f"1. Pay using the button below or copy the UPI ID.\n"
                                f"2. Once paid, the seller will verify the transaction on their device.\n"
                                f"3. You will receive a confirmation here once they approve.",
                                parse_mode='Markdown',
                                reply_markup=InlineKeyboardMarkup(kb)
                            )
                        else:
                            await query.message.reply_text(f"❌ Payment Setup Failed: {pay_result.get('message')}")
                else:
                    await query.edit_message_text(text=f"❌ Order Failed: {result.get('message')}")
            except Exception as e:
                await query.edit_message_text(text=f"❌ Relay Failure during checkout.")

    async def handle_chat(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_msg = update.message.text
        user_id = str(update.effective_user.id)
        
        await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

        # System prompt for the persona
        system_prompt = (
            f"You are {self.config.bot_name}, a helpful AI shopping assistant. "
            "You are part of the Gaura Platform, a decentralized e-commerce network. "
            "You help users find products, view AI technical reports from seller phones, and place orders. "
            "Keep responses helpful and concise."
        )

        try:
            # We call the unified backend's chat endpoint for Gemini processing
            # This keeps the Gemini logic centralized while bots are distributed
            backend_url = os.getenv("UCP_SERVER_URL", "http://localhost:8182")
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "message": user_msg,
                    "user_id": f"bot_{self.config.user_id}_{user_id}",
                    "context": {"bot_name": self.config.bot_name}
                }
                resp = await client.post(f"{backend_url}/chat", json=payload)
                if resp.status_code == 200:
                    reply = resp.json().get("response", "I'm having trouble processing that.")
                    await update.message.reply_markdown(reply)
                else:
                    await update.message.reply_text("I'm having trouble connecting to my brain. Please try again later.")
        except Exception as e:
            logger.error(f"Chat error: {e}")
            await update.message.reply_text("I'm momentarily disconnected from the network.")

    async def run(self):
        logger.info(f"🚀 Initializing bot for user {self.config.user_id}...")
        await self.application.initialize()
        await self.application.start()
        await self.application.updater.start_polling()

# --- FASTAPI WRAPPER FOR BOT FACTORY ---

app = FastAPI(title="Gaura Bot Factory Service")

@app.get("/")
def read_root():
    return {"status": "online", "service": "Gaura Bot Factory", "instances": len(BOT_INSTANCES)}
hub_url = os.getenv("HUB_URL", "http://localhost:8200")
active_bots: Dict[str, GauraBotInstance] = {}

@app.post("/start_bot")
async def start_bot(config: BotInstanceConfig):
    """Dynamically start a new Telegram bot instance for a user"""
    if config.user_id in active_bots:
        return {"message": "Bot already running"}
    
    try:
        bot = GauraBotInstance(config, hub_url)
        active_bots[config.user_id] = bot
        asyncio.create_task(bot.run())
        return {"status": "success", "message": f"Bot started for {config.user_id}"}
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def status():
    return {"active_bots": list(active_bots.keys())}

if __name__ == "__main__":
    port = int(os.getenv("BOT_FACTORY_PORT", 8400))
    uvicorn.run(app, host="0.0.0.0", port=port)
