import os
import sys
import asyncio
import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gaura-monolith")

# Define absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UCP_DIR = os.path.join(BASE_DIR, "telegram_ucp_project")
GAURA_DIR = os.path.join(UCP_DIR, "gaura_platform")

# Add to sys.path for module resolution
sys.path.insert(0, UCP_DIR)
sys.path.insert(0, GAURA_DIR)
os.environ["PYTHONPATH"] = f"{UCP_DIR}:{GAURA_DIR}:{BASE_DIR}"

# Explicitly load .env
load_dotenv(os.path.join(UCP_DIR, ".env"))

# Redefine internal service URLs to target the monolith itself (localhost)
# This prevents services from trying to hit ports 8001, 8200, 8400 which aren't open in Cloud.
MY_PORT = os.environ.get("PORT", "7860")
os.environ["UCP_SERVER_URL"] = f"http://localhost:{MY_PORT}/api/backend"
os.environ["HUB_URL"] = f"http://localhost:{MY_PORT}/api/hub"
os.environ["BOT_FACTORY_URL"] = f"http://localhost:{MY_PORT}/api/factory"
os.environ["NODE_SERVICE_URL"] = f"http://localhost:{MY_PORT}/api/node"

# Import apps (Using try-except to handle module path differences)
try:
    from telegram_ucp_project.backend_unified import app as backend_app
    from gaura_platform.central_hub.hub import app as hub_app
    from gaura_platform.gaura_bot.factory import app as factory_app
    from gaura_platform.mobile_app.app_server import app as ui_app
    from gaura_platform.mobile_stub.node_service import app as node_app
except ImportError as e:
    logger.error(f"Module Import Error: {e}")
    # Fallback imports
    sys.path.append(os.path.join(UCP_DIR, "gaura_platform", "central_hub"))
    sys.path.append(os.path.join(UCP_DIR, "gaura_platform", "gaura_bot"))
    sys.path.append(os.path.join(UCP_DIR, "gaura_platform", "mobile_app"))
    sys.path.append(os.path.join(UCP_DIR, "gaura_platform", "mobile_stub"))
    from backend_unified import app as backend_app
    from hub import app as hub_app
    from factory import app as factory_app
    from app_server import app as ui_app
    from node_service import app as node_app

# Create Master App
master_app = FastAPI(
    title="Gaura Platform Monolith",
    description="Consolidated services to fit in 512MB RAM"
)

master_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check for Render
@master_app.get("/health")
async def health():
    return {"status": "ok", "mode": "monolith", "memory_optimized": True}

# Route mounting (Mapping separate services to sub-routes)
master_app.mount("/api/hub", hub_app)
master_app.mount("/api/backend", backend_app)
master_app.mount("/api/factory", factory_app)
master_app.mount("/api/node", node_app)

# The UI App serves the root and static files
master_app.mount("/", ui_app)

# Background Telegram Bot (Optional for Free Tier to save even more RAM)
def start_telegram_bot():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token or "YOUR_TOKEN" in token:
        logger.info("ℹ️ No Telegram Bot token found. Bot service disabled.")
        return

    try:
        from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters
        from telegram_ucp_project.bot import start, search, view_cart, clear_cart, checkout, add_to_cart, chat_message
        
        logger.info(f"🤖 Starting Telegram Bot service...")
        bot_application = ApplicationBuilder().token(token).build()
        
        bot_application.add_handler(CommandHandler("start", start))
        bot_application.add_handler(CommandHandler("search", search))
        bot_application.add_handler(CommandHandler("cart", view_cart))
        bot_application.add_handler(CommandHandler("clear", clear_cart))
        bot_application.add_handler(CommandHandler("checkout", checkout))
        bot_application.add_handler(MessageHandler(filters.Regex(r'(?i)^add\s+'), add_to_cart))
        bot_application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, chat_message))

        # Run polling in its own thread to avoid blocking FastAPI
        import threading
        bot_thread = threading.Thread(target=bot_application.run_polling, kwargs={"close_loop": False}, daemon=True)
        bot_thread.start()
        logger.info("✅ Telegram Bot polling in background thread.")
    except Exception as e:
        logger.error(f"❌ Failed to start Telegram Bot: {e}")

@master_app.on_event("startup")
async def startup_event():
    logger.info("🚀 Gaura Monolith: Booting all subsystems...")
    # Conditionally start bot
    start_telegram_bot()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    logger.info(f"🔥 Monolith ignition on port {port}")
    uvicorn.run(master_app, host="0.0.0.0", port=port)
