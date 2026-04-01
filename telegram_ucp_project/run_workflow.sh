#!/bin/bash
echo "--- 1. Registering User ---"
TS=$(date +%s)
USER_JSON=$(curl -s -X POST "http://localhost:8200/signup" -H "Content-Type: application/json" -d "{\"email\": \"work$TS@gaura.ai\", \"password\": \"pass\", \"name\": \"Workflow Tester\", \"role\": \"vendor\"}")
USER_ID=$(echo $USER_JSON | jq -r .user_id)
echo "User ID: $USER_ID"

echo "--- 2. Registering Node ---"
curl -s -X POST "http://localhost:8200/register_node?node_id=phone_wf&callback_url=http://localhost:9006"

echo "--- 3. Starting Node Service ---"
export NODE_ID="phone_wf"
export NODE_PORT=9006
python3 gaura_platform/mobile_stub/node_service.py > wf_node.log 2>&1 &
sleep 5

echo "--- 4. Starting Bot ---"
curl -s -X POST "http://localhost:8400/start_bot" -H "Content-Type: application/json" -d "{
    \"user_id\": \"$USER_ID\",
    \"bot_token\": \"8505138420:AAHNS7xIWOaxwKf4OD0tfDIyUqzZpzr6y-Q\",
    \"bot_name\": \"WFBot\"
}"

echo "--- 5. Uploading Product ---"
UPLOAD_RES=$(curl -s -X POST "http://localhost:9006/execute" -H "Content-Type: application/json" -d '{
    "action": "process_seller_upload",
    "payload": {
        "name": "Pure Local Ghee",
        "category": "Farm",
        "price": 25.0,
        "image_data": "YmFzZTY0X2Zha2VfaW1hZ2U="
    }
}')
PROD_ID=$(echo $UPLOAD_RES | jq -r .data.id)
echo "Product ID: $PROD_ID"

echo "--- 6. Publishing Metadata ---"
curl -s -X POST "http://localhost:8200/publish_metadata" -H "Content-Type: application/json" -d "{
    \"id\": \"$PROD_ID\",
    \"vendor_id\": \"phone_wf\",
    \"node_id\": \"phone_wf\",
    \"name\": \"Pure Local Ghee\",
    \"category\": \"Farm\",
    \"base_price\": 25.0
}"

echo "--- 7. Bot Conversation: Search ---"
curl -s -X POST "http://localhost:8182/chat" -H "Content-Type: application/json" -d "{
    \"message\": \"Show me some ghee\",
    \"user_id\": \"$USER_ID\"
}" | jq .

echo "--- 8. Bot Conversation: Add to Cart ---"
curl -s -X POST "http://localhost:8182/chat" -H "Content-Type: application/json" -d "{
    \"message\": \"add gaura::phone_wf::$PROD_ID\",
    \"user_id\": \"$USER_ID\"
}" | jq .

echo "--- 9. Bot Conversation: Checkout ---"
curl -s -X POST "http://localhost:8182/chat" -H "Content-Type: application/json" -d "{
    \"message\": \"checkout\",
    \"user_id\": \"$USER_ID\"
}" | jq .
