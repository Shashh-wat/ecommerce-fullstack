#!/bin/bash

API_URL="http://localhost:8001"

echo "🧪 Creating Demo Accounts..."
echo ""

echo "1️⃣  Creating Buyer Demo Account..."
curl -s -X POST "$API_URL/auth/buyer/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@demo.com",
    "password": "DemoPass123!",
    "name": "Demo Buyer"
  }' > /dev/null

echo "✅ Buyer account created/already exists"
echo "   Email: buyer@demo.com"
echo "   Password: DemoPass123!"
echo ""

echo "2️⃣  Creating Vendor Demo Account..."
curl -s -X POST "$API_URL/auth/vendor/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@demo.com",
    "password": "DemoPass123!",
    "business_name": "Demo Store",
    "name": "Demo Vendor"
  }' > /dev/null

echo "✅ Vendor account created/already exists"
echo "   Email: vendor@demo.com"
echo "   Password: DemoPass123!"
echo ""

echo "🎉 Demo accounts ready!"
echo ""
echo "📝 Next Steps:"
echo "   1. Go to: http://localhost:8000/index-landing.html"
echo "   2. Click 'Shop as Buyer' → Login with buyer@demo.com"
echo "   3. OR Click 'Manage as Vendor' → Login with vendor@demo.com"