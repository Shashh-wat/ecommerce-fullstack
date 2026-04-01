import socket
import sys

def check_port(port, name):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        try:
            s.connect(("127.0.0.1", port))
            print(f"✅ Port {port} ({name}): ONLINE")
            return True
        except:
            print(f"❌ Port {port} ({name}): OFFLINE")
            return False

print("🏥 GAURA SYSTEM PORT DIAGNOSIS\n" + "="*30)
ports = [
    (8182, "Unified API"),
    (8200, "Central Hub"),
    (8400, "Bot Factory"),
    (8500, "Mobile App Front-end"),
    (9001, "Edge Node 1"),
    (9002, "Edge Node 2")
]

all_up = True
for p, n in ports:
    if not check_port(p, n):
        all_up = False

if all_up:
    print("\n✨ ALL PORTS ARE ACTIVE! Reachable via http://localhost:PORT")
else:
    print("\n⚠️ SOME PORTS ARE DOWN. Check logs or run 'pkill -f python' and reboot.")
