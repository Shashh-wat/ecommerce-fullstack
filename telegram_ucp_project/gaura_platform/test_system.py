import httpx
import asyncio
import subprocess
import time
import os
import signal

import sys

async def test_full_ecosystem():
    print("🛠️  Starting Gaura Platform Integration Test...")
    python_exe = sys.executable
    cwd = os.getcwd()
    
    # Ensure modules are importable
    env = os.environ.copy()
    env["PYTHONPATH"] = cwd

    # 1. Start Hub
    hub_proc = subprocess.Popen([python_exe, "gaura_platform/central_hub/hub.py"], env=env)
    print("🌍 Hub started on port 8200")
    time.sleep(5) 

    # 2. Start two Node Services (Phones)
    env1 = env.copy()
    env1["NODE_ID"] = "phone_organic"
    env1["NODE_PORT"] = "9001"
    node1_proc = subprocess.Popen([python_exe, "gaura_platform/mobile_stub/node_service.py"], env=env1)
    
    env2 = env.copy()
    env2["NODE_ID"] = "phone_tech"
    env2["NODE_PORT"] = "9002"
    node2_proc = subprocess.Popen([python_exe, "gaura_platform/mobile_stub/node_service.py"], env=env2)
    
    print("📲 Two Mobile Nodes started (Ports 9001, 9002)")
    time.sleep(5) 

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 3. Register Nodes
        print("\n[Test] Registering nodes with Hub...")
        await client.post("http://localhost:8200/register_node", params={"node_id": "phone_organic", "callback_url": "http://localhost:9001"})
        await client.post("http://localhost:8200/register_node", params={"node_id": "phone_tech", "callback_url": "http://localhost:9002"})

        # 4. Simulate Seller Upload on Phone Organic
        print("[Test] Simulating AI-Compute on 'phone_organic'...")
        # Since node_service doesn't have an 'upload' endpoint exposed to the web (only /execute), 
        # we'll reach into the node object or simulate it via /execute if we had one.
        # For this test, we'll manually push metadata to the hub.
        await client.post("http://localhost:8200/publish_metadata", json={
            "id": "prod_milk_1", "vendor_id": "phone_organic", "node_id": "phone_organic", 
            "name": "Organic Almond Milk", "category": "Grocery", "base_price": 4.99
        })

        # 5. Search Test
        print("\n[Test] Searching for 'milk' via Hub...")
        search_res = await client.get("http://localhost:8200/search", params={"query": "milk"})
        items = search_res.json()
        print(f"🔍 Found: {items[0]['name']} on Node: {items[0]['node_id']}")

        # 6. RELAY TEST (Crucial)
        print("\n[Test] Triggering Relay: Hub -> Phone (Fetch Tech Report)...")
        relay_payload = {
            "target_node_id": "phone_organic",
            "action": "get_tech_report",
            "payload": {"product_id": "prod_milk_1"}
        }
        
        # Note: We need a dummy report file to exist for this to succeed since we skipped the upload step
        os.makedirs("gaura_platform/mobile_stub/local_vault/reports", exist_ok=True)
        with open("gaura_platform/mobile_stub/local_vault/reports/report_prod_milk_1.md", "w") as f:
            f.write("# MOCK AI REPORT\n- Verified: Yes\n- Grade: A")

        relay_res = await client.post("http://localhost:8200/relay_request", json=relay_payload)
        result = relay_res.json()
        
        if result.get("status") == "success":
            print("✅ RELAY SUCCESS!")
            print(f"📄 Data received from remote phone: {result['data']['report']}")
        else:
            print(f"❌ RELAY FAILED: {result}")

    # Cleanup
    print("\nShutting down test environment...")
    hub_proc.terminate()
    node1_proc.terminate()
    node2_proc.terminate()

if __name__ == "__main__":
    asyncio.run(test_full_ecosystem())
