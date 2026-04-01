import sqlite3
import httpx
import uvicorn
import uuid
import asyncio
from fastapi import FastAPI, HTTPException, Request
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

# Shared config
from gaura_platform.config.schema import PlatformItem, HubRelayRequest, MobileResponse, UserAuthRequest, UserProfile
from gaura_platform.gaura_bot.bot_father_agent import BotFatherAgent

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"))

app = FastAPI(title="Gaura AI Central Hub (The Middleman)")

@app.get("/")
def read_root():
    return {"status": "online", "service": "Gaura Central Hub", "version": "1.0.0"}

DB_PATH = "hub_registry.db"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Hub: Supabase registry connected")
    except Exception as e:
        print(f"⚠️ Hub: Supabase connection failed: {e}")

def init_db():
    print(f"🗄️ [Hub] Initializing DB at: {os.path.abspath(DB_PATH)}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Node Registry: Stores where each 'phone' is listening
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS nodes (
            node_id TEXT PRIMARY KEY,
            callback_url TEXT,
            status TEXT,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Metadata Index: The "Google Search" cache
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS metadata_index (
            id TEXT PRIMARY KEY,
            node_id TEXT,
            name TEXT,
            category TEXT,
            price REAL,
            ai_generated_image_url TEXT
        )
    ''')
    # User Registry
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password TEXT,
            name TEXT,
            role TEXT,
            node_id TEXT,
            bot_token TEXT,
            upi_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.post("/register_node")
async def register_node(node_id: str, callback_url: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO nodes (node_id, callback_url, status, last_seen)
        VALUES (?, ?, 'online', CURRENT_TIMESTAMP)
    ''', (node_id, callback_url))
    conn.commit()
    conn.close()
    return {"message": f"Node {node_id} registered"}

@app.post("/publish_metadata")
async def publish_metadata(item: PlatformItem):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO metadata_index (id, node_id, name, category, price, ai_generated_image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (item.id, item.node_id, item.name, item.category, item.base_price, item.ai_generated_image_url))
    conn.commit()
    conn.close()
    return {"message": "Metadata indexed"}

from gaura_platform.config.schema import UserAuthRequest, UserProfile
import uuid

@app.post("/signup")
async def signup(req: UserAuthRequest):
    print(f"📝 [Hub] Signup attempt for: {req.email}")
    user_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO users (id, email, password, name, role, bot_token, upi_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, req.email, req.password, req.name, req.role, req.bot_token, req.upi_id))
        conn.commit()
        
        # Proactively start their bot if token provided
        if req.bot_token:
            await trigger_user_bot(user_id, req.bot_token, req.name)
            
        return {"status": "success", "user_id": user_id}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists")
    finally:
        conn.close()

async def trigger_user_bot(user_id: str, token: str, name: str):
    """Signals the Bot Factory to spin up this user's instance"""
    bot_factory_url = os.getenv("BOT_FACTORY_URL", "http://localhost:8400")
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "user_id": user_id,
                "bot_token": token,
                "bot_name": f"Gaura AI ({name})" if name else "Gaura AI"
            }
            await client.post(f"{bot_factory_url}/start_bot", json=payload)
        except Exception as e:
            print(f"⚠️ Failed to signal Bot Factory: {e}")

@app.post("/auto_create_bot")
async def auto_create_bot(user_id: str, bot_name: str):
    """
    Triggers the BotFather Agent to create a bot for this user.
    """
    agent = BotFatherAgent()
    try:
        if await agent.start():
            safe_username = f"gaura_{bot_name.lower().replace(' ', '_')}_{user_id[:4]}bot"
            result = await agent.create_new_bot(f"Gaura AI ({bot_name})", safe_username)
            await agent.logout()
            
            if result["status"] == "success":
                token = result["token"]
                # Save to user profile
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("UPDATE users SET bot_token = ? WHERE id = ?", (token, user_id))
                conn.commit()
                conn.close()
                
                # Signal factory to start
                await trigger_user_bot(user_id, token, bot_name)
                return {"status": "success", "token": token, "username": result["username"]}
            else:
                return {"status": "error", "message": result["message"]}
    except Exception as e:
        return {"status": "error", "message": str(e)}

import logging
logging.basicConfig(level=logging.INFO)

@app.post("/login")
async def login(req: UserAuthRequest):
    print(f"🔑 [Hub] Login attempt for: {req.email}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (req.email, req.password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        user_dict = dict(user)
        # Ensure their bot is running if they have a token
        if user_dict.get("bot_token"):
            await trigger_user_bot(user_dict["id"], user_dict["bot_token"], user_dict["name"])
        return {"status": "success", "user": user_dict}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/link_node")
async def link_node(user_id: str, node_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET node_id = ? WHERE id = ?", (node_id, user_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/process_payment")
async def process_payment(order_id: str, vendor_node_id: str, amount: float):
    """Generates a UPI Payment Link for the Buyer"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    # Find vendor's UPI ID
    cursor.execute("SELECT upi_id, name FROM users WHERE node_id = ?", (vendor_node_id,))
    vendor = cursor.fetchone()
    conn.close()
    
    if not vendor or not vendor['upi_id']:
        return {"status": "error", "message": "Vendor has not set up UPI"}
    
    # Standard UPI Deep Link: upi://pay?pa=ID&pn=NAME&am=AMOUNT&tn=ORDER_ID
    upi_link = f"upi://pay?pa={vendor['upi_id']}&pn={vendor['name']}&am={amount}&tn=Order_{order_id}"
    
    print(f"💰 Hub: Generated UPI link for order {order_id} -> {vendor['upi_id']}")
    return {
        "status": "success", 
        "mode": "upi", 
        "upi_id": vendor['upi_id'],
        "upi_link": upi_link,
        "amount": amount
    }

@app.post("/confirm_upi_payment")
async def confirm_upi_payment(order_id: str, vendor_node_id: str):
    """Called by the Seller's App when they see money in their bank"""
    print(f"✅ Hub: Seller {vendor_node_id} confirmed payment for {order_id}")
    
    async with httpx.AsyncClient() as client:
        relay_payload = {
            "target_node_id": vendor_node_id,
            "action": "update_order",
            "payload": {
                "order_id": order_id,
                "payment_status": "paid"
            }
        }
        try:
            await client.post(f"http://localhost:8200/relay_request", json=relay_payload)
        except Exception as e:
            print(f"⚠️ Notification relay failed: {e}")

    return {"status": "success"}

@app.get("/search")
async def search_items(query: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM metadata_index 
        WHERE name LIKE ? OR category LIKE ?
    ''', (f'%{query}%', f'%{query}%'))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/relay_request")
async def relay_request(relay: HubRelayRequest):
    """
    The core of the architecture. 
    Routes a request to a specific phone and returns its local response.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT callback_url FROM nodes WHERE node_id = ?", (relay.target_node_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Target phone not found or offline")
    
    target_url = row[0]
    
    # We forward the action and payload to the phone
    async with httpx.AsyncClient() as client:
        try:
            forward_data = {
                "action": relay.action,
                "payload": relay.payload
            }
            response = await client.post(f"{target_url}/execute", json=forward_data)
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Failed to reach target phone: {str(e)}")

import httpx

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8200)
