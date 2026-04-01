#!/usr/bin/env python3
"""
Gaura Platform — Unified Launch Script
Starts all services in the right order and integrates the image service
with the mobile app frontend.
"""
import subprocess
import sys
import os
import time
import asyncio
import httpx

BASE = os.path.dirname(os.path.abspath(__file__))
UCP_DIR = os.path.join(BASE, "telegram_ucp_project")
PLATFORM_DIR = os.path.join(UCP_DIR, "gaura_platform")
ENV_FILE = os.path.join(UCP_DIR, ".env")

def load_env():
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    os.environ.setdefault(key.strip(), val.strip())

load_env()

HF_TOKEN    = os.environ.get("HF_TOKEN", "")
GEMINI_KEY  = os.environ.get("GEMINI_API_KEY", "")
BOT_TOKEN   = os.environ.get("TELEGRAM_BOT_TOKEN", "")

CYAN  = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED   = "\033[91m"
BOLD  = "\033[1m"
RESET = "\033[0m"

procs = []

def start(label, cmd, cwd=None, env_extra=None):
    env = os.environ.copy()
    env["PYTHONPATH"] = UCP_DIR  # Extremely important for gaura_platform module resolution
    if env_extra:
        env.update(env_extra)
    p = subprocess.Popen(
        cmd, cwd=cwd or BASE, env=env,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    procs.append(p)
    print(f"  {GREEN}✅ {label}{RESET}  (pid {p.pid})")
    return p

async def wait_for(url, label, timeout=15):
    for _ in range(timeout):
        try:
            async with httpx.AsyncClient() as c:
                r = await c.get(url, timeout=2)
                if r.status_code < 500:
                    return True
        except Exception:
            pass
        await asyncio.sleep(1)
    print(f"  {RED}⚠️  {label} not responding at {url}{RESET}")
    return False

async def main():
    print(f"\n{BOLD}{CYAN}{'═'*60}{RESET}")
    print(f"{BOLD}{CYAN}  🚀  GAURA PLATFORM — FULL SYSTEM LAUNCH{RESET}")
    print(f"{BOLD}{CYAN}{'═'*60}{RESET}\n")

    # ── 1. MCP Backend (already running, just verify) ──────────────
    print(f"{BOLD}[1/5] MCP Backend Unified (port 8182){RESET}")
    ok = await wait_for("http://localhost:8182/health", "MCP Backend", 3)
    if not ok:
        start("MCP Backend", [sys.executable, "-m", "uvicorn", "telegram_ucp_project.backend_unified:app", "--port", "8182", "--host", "0.0.0.0"])
        await wait_for("http://localhost:8182/health", "MCP Backend")

    # ── 2. Central Hub ─────────────────────────────────────────────
    print(f"\n{BOLD}[2/5] Central Hub (port 8200){RESET}")
    ok = await wait_for("http://localhost:8200", "Hub", 3)
    if not ok:
        start("Central Hub", [sys.executable, "gaura_platform/central_hub/hub.py"], cwd=UCP_DIR)
        await asyncio.sleep(3)
        await wait_for("http://localhost:8200", "Hub")

    # ── 3. Bot Factory ─────────────────────────────────────────────
    print(f"\n{BOLD}[3/5] Bot Factory (port 8400){RESET}")
    ok = await wait_for("http://localhost:8400", "Bot Factory", 3)
    if not ok:
        start("Bot Factory", [sys.executable, "gaura_platform/gaura_bot/factory.py"], cwd=UCP_DIR)
        await asyncio.sleep(2)
        await wait_for("http://localhost:8400", "Bot Factory")

    # ── 4. Node Services ––– (phone_organic + phone_tech) ──────────
    print(f"\n{BOLD}[4/5] Mobile Node Services (ports 9001, 9002){RESET}")
    ok1 = await wait_for("http://localhost:9001", "Node-organic", 2)
    if not ok1:
        start("Node phone_organic :9001",
              [sys.executable, "gaura_platform/mobile_stub/node_service.py"],
              cwd=UCP_DIR,
              env_extra={"NODE_ID": "phone_organic", "NODE_PORT": "9001"})

    ok2 = await wait_for("http://localhost:9002", "Node-tech", 2)
    if not ok2:
        start("Node phone_tech :9002",
              [sys.executable, "gaura_platform/mobile_stub/node_service.py"],
              cwd=UCP_DIR,
              env_extra={"NODE_ID": "phone_tech", "NODE_PORT": "9002"})

    await asyncio.sleep(2)

    # ── 5. Mobile App UI (Seller frontend) ─────────────────────────
    print(f"\n{BOLD}[5/5] Mobile App UI — Seller Frontend (port 8500){RESET}")
    ok = await wait_for("http://localhost:8500", "Mobile UI", 2)
    if not ok:
        start("Mobile App UI :8500",
              [sys.executable, "gaura_platform/mobile_app/app_server.py"],
              cwd=UCP_DIR,
              env_extra={"NODE_ID": "phone_organic", "HF_TOKEN": HF_TOKEN})
        await asyncio.sleep(2)
        await wait_for("http://localhost:8500", "Mobile UI")

    # ── Telegram Bot ───────────────────────────────────────────────
    print(f"\n{BOLD}[+] Telegram Bot{RESET}")
    if BOT_TOKEN and BOT_TOKEN != "YOUR_TOKEN_HERE":
        start("Telegram Bot",
              [sys.executable, "bot.py"],
              cwd=UCP_DIR,
              env_extra={
                  "UCP_SERVER_URL": "http://localhost:8182",
                  "TELEGRAM_BOT_TOKEN": BOT_TOKEN,
                  "HF_TOKEN": HF_TOKEN,
              })
        print(f"  {CYAN}Bot token: {BOT_TOKEN[:10]}...{RESET}")
    else:
        print(f"  {YELLOW}⚠️  No TELEGRAM_BOT_TOKEN set. Skipping bot.{RESET}")

    # ── Summary ────────────────────────────────────────────────────
    print(f"\n{BOLD}{GREEN}{'═'*60}{RESET}")
    print(f"{BOLD}{GREEN}  ✅  ALL SERVICES LAUNCHED{RESET}")
    print(f"{BOLD}{GREEN}{'═'*60}{RESET}")
    print(f"""
  🛒  MCP Backend        → http://localhost:8182
  🌐  Central Hub        → http://localhost:8200
  🤖  Bot Factory        → http://localhost:8400
  📱  Seller Mobile App  → http://localhost:8500   ← Open this!
  📡  Node organic       → http://localhost:9001
  📡  Node tech          → http://localhost:9002

  HF Image Gen  : {'✅ Ready' if HF_TOKEN else '❌ No token'}
  Gemini AI     : {'✅ Ready' if GEMINI_KEY else '⚠️  No key (keyword fallback mode)'}
  Telegram Bot  : {'✅ Running' if BOT_TOKEN else '❌ No token'}

  {BOLD}Open http://localhost:8500 to test product upload + AI image gen{RESET}
  {BOLD}Test your Telegram bot with /start{RESET}
""")

    # Keep alive
    print("  Press Ctrl+C to stop all services.\n")
    try:
        while True:
            await asyncio.sleep(5)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Stopping all services...{RESET}")
        for p in procs:
            p.terminate()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
