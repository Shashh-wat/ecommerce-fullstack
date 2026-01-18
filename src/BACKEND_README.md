# Kozhikode Reconnect - Backend Documentation

## Overview

Your marketplace now has a complete backend infrastructure powered by **Supabase** with the following capabilities:

### ✅ Features Implemented

1. **User Authentication**
   - Email/password signup and signin
   - Secure session management
   - JWT token-based authentication
   - Automatic email confirmation

2. **Product Management**
   - Create, read, update, and delete products
   - Seller authorization (only sellers can edit their own products)
   - Product catalog with categories
   - Image and metadata storage

3. **Shopping Cart**
   - Add/remove items
   - Update quantities
   - Persist cart across sessions
   - Clear cart functionality

4. **Wishlist**
   - Save favorite products
   - Add/remove items
   - Persistent storage per user

5. **Order Management**
   - Create orders from cart
   - Track order history
   - Order status management
   - Automatic cart clearing after order

---

## API Endpoints

### Base URL
\`\`\`
https://{projectId}.supabase.co/functions/v1/make-server-93d78077
\`\`\`

### Authentication Routes

#### Sign Up
\`\`\`
POST /auth/signup
Body: { email, password, name? }
Response: { success, userId, message }
\`\`\`

#### Sign In
\`\`\`
POST /auth/signin
Body: { email, password }
Response: { success, accessToken, user }
\`\`\`

#### Get Session
\`\`\`
GET /auth/session
Headers: { Authorization: "Bearer {token}" }
Response: { success, user }
\`\`\`

#### Sign Out
\`\`\`
POST /auth/signout
Headers: { Authorization: "Bearer {token}" }
Response: { success, message }
\`\`\`

### Product Routes

#### Get All Products
\`\`\`
GET /products
Response: { success, products: [] }
\`\`\`

#### Get Product by ID
\`\`\`
GET /products/:id
Response: { success, product }
\`\`\`

#### Create Product (Auth Required)
\`\`\`
POST /products
Headers: { Authorization: "Bearer {token}" }
Body: { name, category, price, image, description, ... }
Response: { success, product }
\`\`\`

#### Update Product (Auth Required)
\`\`\`
PUT /products/:id
Headers: { Authorization: "Bearer {token}" }
Body: { updates }
Response: { success, product }
\`\`\`

#### Delete Product (Auth Required)
\`\`\`
DELETE /products/:id
Headers: { Authorization: "Bearer {token}" }
Response: { success, message }
\`\`\`

### Cart Routes (All Require Auth)

#### Get Cart
\`\`\`
GET /cart
Headers: { Authorization: "Bearer {token}" }
Response: { success, cart }
\`\`\`

#### Add to Cart
\`\`\`
POST /cart/add
Headers: { Authorization: "Bearer {token}" }
Body: { productId, quantity? }
Response: { success, cart }
\`\`\`

#### Remove from Cart
\`\`\`
POST /cart/remove
Headers: { Authorization: "Bearer {token}" }
Body: { productId }
Response: { success, cart }
\`\`\`

#### Clear Cart
\`\`\`
POST /cart/clear
Headers: { Authorization: "Bearer {token}" }
Response: { success, message }
\`\`\`

### Wishlist Routes (All Require Auth)

#### Get Wishlist
\`\`\`
GET /wishlist
Headers: { Authorization: "Bearer {token}" }
Response: { success, wishlist }
\`\`\`

#### Add to Wishlist
\`\`\`
POST /wishlist/add
Headers: { Authorization: "Bearer {token}" }
Body: { productId }
Response: { success, wishlist }
\`\`\`

#### Remove from Wishlist
\`\`\`
POST /wishlist/remove
Headers: { Authorization: "Bearer {token}" }
Body: { productId }
Response: { success, wishlist }
\`\`\`

### Order Routes (All Require Auth)

#### Create Order
\`\`\`
POST /orders
Headers: { Authorization: "Bearer {token}" }
Body: { items, shippingAddress, total, ... }
Response: { success, order }
\`\`\`

#### Get All Orders
\`\`\`
GET /orders
Headers: { Authorization: "Bearer {token}" }
Response: { success, orders: [] }
\`\`\`

#### Get Order by ID
\`\`\`
GET /orders/:id
Headers: { Authorization: "Bearer {token}" }
Response: { success, order }
\`\`\`

---

## Frontend Integration

### Using the API Utility

The `/utils/api.ts` file provides convenient functions to interact with the backend:

\`\`\`typescript
import { authAPI, productAPI, cartAPI, wishlistAPI, orderAPI } from './utils/api';

// Authentication
const signUp = async () => {
  const result = await authAPI.signup('email@example.com', 'password', 'Name');
};

const signIn = async () => {
  const result = await authAPI.signin('email@example.com', 'password');
  // Token is automatically stored
};

const user = authAPI.getCurrentUser();
const isLoggedIn = authAPI.isAuthenticated();

// Products
const products = await productAPI.getAll();
const product = await productAPI.getById('product-id');

// Cart (requires authentication)
await cartAPI.addItem('product-id', 2);
const cart = await cartAPI.get();
await cartAPI.removeItem('product-id');

// Wishlist (requires authentication)
await wishlistAPI.addItem('product-id');
const wishlist = await wishlistAPI.get();

// Orders (requires authentication)
const order = await orderAPI.create({
  items: [...],
  shippingAddress: '...',
  total: 1299
});
\`\`\`

---

## Database Schema (KV Store)

Data is stored in the Supabase KV (Key-Value) store with the following prefixes:

### User Data
\`\`\`
Key: user:{userId}
Value: { id, email, name, createdAt }
\`\`\`

### Products
\`\`\`
Key: product:{productId}
Value: { 
  id, 
  name, 
  category, 
  price, 
  image, 
  description,
  seller,
  sellerId,
  availability,
  rating,
  createdAt,
  updatedAt?
}
\`\`\`

### Cart
\`\`\`
Key: cart:{userId}
Value: { 
  items: [
    { productId, quantity, addedAt }
  ]
}
\`\`\`

### Wishlist
\`\`\`
Key: wishlist:{userId}
Value: { 
  items: [productId1, productId2, ...]
}
\`\`\`

### Orders
\`\`\`
Key: order:{orderId}
Value: {
  id,
  userId,
  items,
  shippingAddress,
  total,
  status,
  createdAt
}
\`\`\`

---

## Seeding the Database

To populate your marketplace with initial products, use the seed function:

\`\`\`typescript
import { seedProducts } from './utils/seedProducts';

// Call this once to populate the database
await seedProducts();
\`\`\`

This will:
1. Create a demo seller account
2. Add 10 initial products across all categories
3. Sign out the demo account

---

## Security Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Row-Level Security** - Users can only modify their own data  
✅ **Authorization Checks** - Protected routes require valid tokens  
✅ **Email Confirmation** - Auto-confirmed in demo (configure SMTP for production)  
✅ **CORS Enabled** - Configured for frontend access  
✅ **Error Logging** - Comprehensive error messages for debugging

---

## Next Steps

### 1. **Connect Frontend Components**
Update your marketplace page to fetch products from the API instead of using static data.

### 2. **Add Authentication UI**
Create login/signup forms that use the `authAPI` functions.

### 3. **Enable Cart & Wishlist**
Make the cart and wishlist buttons functional by connecting them to the backend.

### 4. **Seller Dashboard**
Create a page where sellers can add and manage their products.

### 5. **Order Processing**
Add checkout flow and order confirmation pages.

---

## Important Notes

⚠️ **Email Server**: Email confirmation is auto-enabled. For production, configure SMTP in Supabase settings.

⚠️ **Security**: The SUPABASE_SERVICE_ROLE_KEY is kept secure on the server. Never expose it to the frontend.

⚠️ **Data Persistence**: All data is stored in the Supabase KV store and persists across sessions.

⚠️ **Rate Limiting**: Consider adding rate limiting for production use.

---

## Testing the Backend

### Health Check
\`\`\`bash
curl https://{projectId}.supabase.co/functions/v1/make-server-93d78077/health
\`\`\`

Should return: \`{ "status": "ok" }\`

### Test Sign Up
\`\`\`typescript
const result = await authAPI.signup('test@example.com', 'TestPass123!', 'Test User');
console.log(result);
\`\`\`

### Test Product Fetch
\`\`\`typescript
const products = await productAPI.getAll();
console.log(products);
\`\`\`

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Hono Framework**: https://hono.dev/
- **KV Store Guide**: Check `/supabase/functions/server/kv_store.tsx`

---

**Your backend is now fully operational and ready for integration! 🎉**
