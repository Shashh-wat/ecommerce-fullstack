# 🎭 Kozhikode Reconnect - Demo Accounts

## Available Demo Accounts

All demo accounts use the password: `demo123`

### 1. 🛒 Buyer Account
**Test the customer shopping experience**

- **Email:** `buyer@demo.com`
- **Password:** `demo123`
- **Name:** Demo Buyer

**What to test:**
- Browse marketplace products
- Search and filter products
- Add items to cart
- Add items to wishlist
- Complete checkout process
- View order history
- Update profile information

---

### 2. 🏪 Seller Account
**Test the seller/vendor experience**

- **Email:** `seller@demo.com`
- **Password:** `demo123`
- **Name:** Demo Seller

**What to test:**
- Access seller dashboard
- Create new products
- Edit existing products
- Delete products
- Upload product images
- Set prices and inventory
- View sales (orders containing your products)

---

### 3. 👨‍💼 Admin Account
**Test full platform access**

- **Email:** `admin@demo.com`
- **Password:** `demo123`
- **Name:** Demo Admin

**What to test:**
- All buyer features
- All seller features
- Full system access
- Test different user flows

---

## 🚀 Quick Start Guide

### First Time Setup

1. **Run the seeding script** (if accounts don't exist yet):
   ```
   The accounts will be created automatically when you try to sign in for the first time, or you can run the seed-demo-users.ts script
   ```

2. **Sign in to the marketplace:**
   - Go to the marketplace page
   - Click "Sign In" in the header
   - Use any of the demo account credentials above

3. **Start testing!**

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Purchase Flow
1. Sign in with `buyer@demo.com`
2. Browse products on the marketplace
3. Add 2-3 products to cart
4. Add 1-2 products to wishlist
5. Go to cart and proceed to checkout
6. Fill in shipping information
7. Complete the order
8. View order in "My Orders" page

### Scenario 2: Seller Product Management
1. Sign in with `seller@demo.com`
2. Go to Seller Dashboard
3. Click "Add New Product"
4. Fill in product details:
   - Name, description, price
   - Category, stock
   - Upload image
5. Save the product
6. Edit the product you just created
7. View the product on the marketplace
8. (Optional) Delete the test product

### Scenario 3: Multi-User Experience
1. Sign in with `seller@demo.com` and create a product
2. Sign out
3. Sign in with `buyer@demo.com`
4. Find and purchase the seller's product
5. Sign out and back in as `seller@demo.com`
6. View that your product has been purchased (in orders)

### Scenario 4: Wishlist & Cart Management
1. Sign in with `buyer@demo.com`
2. Add 5 products to cart
3. Add 3 products to wishlist
4. Remove 2 items from cart
5. Move 1 item from wishlist to cart
6. Clear cart and start over
7. Add wishlist items to cart and checkout

---

## 📝 Notes

- **Email Confirmation:** Not required - accounts are auto-confirmed
- **Password Reset:** Not implemented in demo (just use `demo123`)
- **Data Persistence:** All data is stored in Supabase KV store
- **Session Duration:** Sessions persist until you sign out
- **Multiple Sessions:** You can open multiple browser tabs to test different accounts simultaneously

---

## 🐛 Troubleshooting

### "Invalid credentials" error
- Double-check email and password (password is `demo123`)
- Make sure the demo accounts have been created (run seed script)

### "Product not found" error
- Make sure the 10 seed products have been created
- Try refreshing the marketplace page

### Cart/Wishlist not updating
- Check browser console for errors
- Make sure you're signed in
- Try signing out and back in

### Seller dashboard not accessible
- Make sure you're signed in with a valid account
- Any account can access seller dashboard
- Check network tab for API errors

---

## 🎯 Feature Checklist

Use this checklist to test all features:

### Authentication
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Session persistence (refresh page)
- [ ] Profile view

### Product Browsing
- [ ] View all products
- [ ] Search products
- [ ] Filter by category
- [ ] View product details
- [ ] Product images display correctly

### Cart
- [ ] Add items to cart
- [ ] Update quantities
- [ ] Remove items
- [ ] View cart drawer
- [ ] Cart count badge updates
- [ ] Cart persists after refresh

### Wishlist
- [ ] Add items to wishlist
- [ ] Remove items
- [ ] View wishlist drawer
- [ ] Wishlist count badge updates
- [ ] Move wishlist items to cart

### Checkout
- [ ] Enter shipping information
- [ ] View order summary
- [ ] Calculate totals correctly
- [ ] Complete order
- [ ] Cart cleared after order
- [ ] Order confirmation shown

### Orders
- [ ] View order history
- [ ] View individual order details
- [ ] Orders show correct items
- [ ] Orders show correct totals
- [ ] Order status displayed

### Seller Dashboard
- [ ] Access dashboard
- [ ] View product list
- [ ] Create new product
- [ ] Edit existing product
- [ ] Delete product
- [ ] Form validation works
- [ ] Changes reflect in marketplace

---

## 💻 Developer Notes

- **Backend:** Supabase Edge Functions with Hono
- **Database:** Supabase KV Store (key-value pairs)
- **Auth:** Supabase Auth with JWT tokens
- **Frontend:** React + TypeScript + Tailwind CSS

### API Endpoints Used:
- `POST /auth/signup` - Create new user
- `POST /auth/signin` - Authenticate user
- `POST /auth/signout` - End session
- `GET /products` - List all products
- `POST /products` - Create product (auth required)
- `PUT /products/:id` - Update product (auth required)
- `DELETE /products/:id` - Delete product (auth required)
- `GET /cart` - Get user cart (auth required)
- `POST /cart/add` - Add to cart (auth required)
- `POST /cart/remove` - Remove from cart (auth required)
- `GET /wishlist` - Get user wishlist (auth required)
- `POST /wishlist/add` - Add to wishlist (auth required)
- `POST /wishlist/remove` - Remove from wishlist (auth required)
- `POST /orders` - Create order (auth required)
- `GET /orders` - List user orders (auth required)

---

**Happy Testing! 🎉**

For issues or questions, check the browser console for detailed error messages.
