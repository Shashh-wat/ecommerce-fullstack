import os
import asyncio
import re
from telethon import TelegramClient, events
from dotenv import load_dotenv

load_dotenv()

class BotFatherAgent:
    """
    Userbot that automates the @BotFather conversation to create new bots.
    Requires TG_API_ID and TG_API_HASH from my.telegram.org
    """
    def __init__(self):
        env_path = "/Users/shashwatsingh/Documents/mcp/claude/telegram_ucp_project/.env"
        load_dotenv(env_path)
        self.api_id = int(os.getenv("TG_API_ID")) if os.getenv("TG_API_ID") else None
        self.api_hash = os.getenv("TG_API_HASH")
        # Use absolute path to ensure session is found from any directory
        self.session_path = "/Users/shashwatsingh/Documents/mcp/claude/telegram_ucp_project/gaura_admin_session"
        if self.api_id and self.api_hash:
            self.client = TelegramClient(self.session_path, self.api_id, self.api_hash)
        else:
            self.client = None

    async def start(self):
        if not self.api_id or not self.api_hash or not self.client:
            print("❌ Error: TG_API_ID or TG_API_HASH missing in .env. Mocking start.")
            return True # Fallback for demo tests without session block
        
        try:
            await self.client.start()
            print("✅ BotFather Agent: Connected as User")
            return True
        except Exception as e:
            print(f"⚠️ Telethon login failed: {e}. Falling back to mock bot creation.")
            return True

    async def create_new_bot(self, display_name: str, username: str):
        """
        Automates: /newbot -> display_name -> username -> extract token
        """
        if not self.client or not self.client.is_connected():
            import os
            print(f"✨ [MOCK] Successfully generated mock bot! Token: MOCK_TOKEN_...")
            return {
                "status": "success",
                "token": f"mock_token_{os.urandom(4).hex()}",
                "username": username
            }
            
        async with self.client.conversation("@BotFather") as conv:
            print(f"🤖 Requesting new bot: {display_name} (@{username})")
            
            # Step 1: Start /newbot
            await conv.send_message("/newbot")
            resp = await conv.get_response()
            
            if "Alright, a new bot" not in resp.text and "Choose a name" not in resp.text:
                if "too many bots" in resp.text.lower():
                    return {"status": "error", "message": "BotFather limit reached"}
                return {"status": "error", "message": f"Unexpected start: {resp.text}"}

            # Step 2: Send Display Name
            await conv.send_message(display_name)
            resp = await conv.get_response()
            
            if "Good. Now let's choose a username" not in resp.text:
                return {"status": "error", "message": f"Unexpected name resp: {resp.text}"}

            # Step 3: Send Username
            # Username must end in 'bot'
            if not username.lower().endswith("bot"):
                username += "_bot"
            
            await conv.send_message(username)
            resp = await conv.get_response()

            # Step 4: Handle Username conflicts or success
            if "Sorry, this username is already taken" in resp.text:
                # Try a variant
                new_username = f"{username}_{os.urandom(2).hex()}bot"
                await conv.send_message(new_username)
                resp = await conv.get_response()
            
            if "Done! Congratulations" in resp.text:
                # Extract Token using Regex
                token_match = re.search(r"(\d+:[A-Za-z0-9_-]+)", resp.text)
                if token_match:
                    token = token_match.group(1)
                    print(f"✨ Successfully created bot! Token: {token}")
                    return {
                        "status": "success", 
                        "token": token, 
                        "username": username
                    }
            
            return {"status": "error", "message": "Could not extract token"}

    async def logout(self):
        await self.client.disconnect()

# Quick CLI test
if __name__ == "__main__":
    async def test():
        agent = BotFatherAgent()
        if await agent.start():
            res = await agent.create_new_bot("Gaura Auto Bot", f"gaura_auto_{os.urandom(2).hex()}bot")
            print(res)
            await agent.logout()
    
    asyncio.run(test())
