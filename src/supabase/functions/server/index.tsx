import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase clients
const getServiceClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
};

const getAnonClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
};

// Helper function to verify user authentication
const verifyUser = async (authHeader: string | null) => {
  if (!authHeader) {
    return { error: 'No authorization header', userId: null };
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'No token provided', userId: null };
  }

  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { error: 'Invalid or expired token', userId: null };
  }
  
  return { error: null, userId: user.id, user };
};

// Health check endpoint
app.get("/make-server-93d78077/health", (c) => {
  return c.json({ status: "ok" });
});

// Seed product endpoint (for demo purposes - no auth required)
app.post("/make-server-93d78077/seed-product", async (c) => {
  try {
    const productData = await c.req.json();
    
    if (!productData.id || !productData.name) {
      return c.json({ error: 'Product id and name are required' }, 400);
    }

    // Check if product already exists
    const existing = await kv.get(`product:${productData.id}`);
    if (existing) {
      console.log(`Product ${productData.id} already exists, skipping...`);
      return c.json({ 
        success: true, 
        message: 'Product already exists',
        product: existing 
      });
    }

    const product = {
      ...productData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`product:${productData.id}`, product);
    
    return c.json({ success: true, product });
  } catch (error: any) {
    console.log(`Seed product error: ${error.message}`);
    return c.json({ error: 'Failed to seed product' }, 500);
  }
});

// ============ AUTHENTICATION ROUTES ============

// Seed demo accounts (for demo purposes - no auth required)
app.post("/make-server-93d78077/seed-demo-accounts", async (c) => {
  try {
    const supabase = getServiceClient();
    const demoAccounts = [
      { 
        email: 'buyer@demo.com', 
        password: 'demo123', 
        name: 'Demo Buyer',
        role: 'buyer'
      },
      { 
        email: 'seller@demo.com', 
        password: 'demo123', 
        name: 'Demo Seller',
        role: 'seller'
      },
      { 
        email: 'admin@demo.com', 
        password: 'demo123', 
        name: 'Demo Admin',
        role: 'admin'
      },
    ];

    const results = [];

    for (const account of demoAccounts) {
      try {
        // Try to create the user
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          user_metadata: { 
            name: account.name,
            role: account.role
          },
          email_confirm: true,
        });

        if (error) {
          // Check if user already exists
          if (error.message.includes('already') || error.message.includes('exists')) {
            console.log(`Demo account ${account.email} already exists, skipping...`);
            results.push({ email: account.email, status: 'already_exists' });
            continue;
          }
          
          console.log(`Error creating demo account ${account.email}: ${error.message}`);
          results.push({ email: account.email, status: 'error', error: error.message });
          continue;
        }

        if (data?.user) {
          // Initialize user data in KV store
          await kv.set(`user:${data.user.id}`, {
            id: data.user.id,
            email: account.email,
            name: account.name,
            role: account.role,
            createdAt: new Date().toISOString(),
          });

          results.push({ email: account.email, status: 'created' });
          console.log(`Demo account ${account.email} created successfully`);
        }
      } catch (accountError: any) {
        console.log(`Error processing demo account ${account.email}: ${accountError.message}`);
        results.push({ email: account.email, status: 'error', error: accountError.message });
      }
    }

    return c.json({ success: true, results });
  } catch (error: any) {
    console.log(`Seed demo accounts error: ${error.message}`);
    return c.json({ error: `Failed to seed demo accounts: ${error.message}` }, 500);
  }
});

// Sign up new user
app.post("/make-server-93d78077/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user data in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name: name || '',
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      success: true, 
      userId: data.user.id,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.log(`Signup error: ${error.message}`);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Sign in user
app.post("/make-server-93d78077/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    console.log(`Attempting signin for: ${email}`);
    
    const supabase = getAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Signin error for ${email}: ${error.message}`);
      return c.json({ error: `Authentication failed: ${error.message}` }, 401);
    }

    if (!data.session || !data.user) {
      console.log(`Signin error for ${email}: No session or user data returned`);
      return c.json({ error: 'Authentication failed - no session created' }, 401);
    }

    console.log(`Signin successful for: ${email}`);
    
    return c.json({ 
      success: true,
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
      }
    });
  } catch (error: any) {
    console.log(`Signin exception: ${error.message}`);
    return c.json({ error: `Sign in failed: ${error.message}` }, 500);
  }
});

// Get current user session
app.get("/make-server-93d78077/auth/session", async (c) => {
  const { error, userId, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const userData = await kv.get(`user:${userId}`);
  
  return c.json({ 
    success: true,
    user: {
      id: userId,
      email: user.email,
      name: userData?.name || user.user_metadata?.name || '',
    }
  });
});

// Sign out
app.post("/make-server-93d78077/auth/signout", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const supabase = getServiceClient();
  await supabase.auth.admin.signOut(userId);
  
  return c.json({ success: true, message: 'Signed out successfully' });
});

// ============ PRODUCT ROUTES ============

// Get all products
app.get("/make-server-93d78077/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ success: true, products: products || [] });
  } catch (error) {
    console.log(`Get products error: ${error.message}`);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Get product by ID
app.get("/make-server-93d78077/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log(`Get product error: ${error.message}`);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// Create product (requires authentication)
app.post("/make-server-93d78077/products", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const productData = await c.req.json();
    const productId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const product = {
      id: productId,
      ...productData,
      sellerId: userId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`product:${productId}`, product);
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log(`Create product error: ${error.message}`);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Update product (requires authentication)
app.put("/make-server-93d78077/products/:id", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const existingProduct = await kv.get(`product:${id}`);
    
    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    if (existingProduct.sellerId !== userId) {
      return c.json({ error: 'Not authorized to update this product' }, 403);
    }

    const updates = await c.req.json();
    const updatedProduct = {
      ...existingProduct,
      ...updates,
      id,
      sellerId: userId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`product:${id}`, updatedProduct);
    
    return c.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log(`Update product error: ${error.message}`);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Delete product (requires authentication)
app.delete("/make-server-93d78077/products/:id", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const existingProduct = await kv.get(`product:${id}`);
    
    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    if (existingProduct.sellerId !== userId) {
      return c.json({ error: 'Not authorized to delete this product' }, 403);
    }

    await kv.del(`product:${id}`);
    
    return c.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.log(`Delete product error: ${error.message}`);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// ============ CART ROUTES ============

// Get user's cart
app.get("/make-server-93d78077/cart", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const cart = await kv.get(`cart:${userId}`) || { items: [] };
    return c.json({ success: true, cart });
  } catch (error) {
    console.log(`Get cart error: ${error.message}`);
    return c.json({ error: 'Failed to fetch cart' }, 500);
  }
});

// Add item to cart
app.post("/make-server-93d78077/cart/add", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { productId, quantity = 1 } = await c.req.json();
    
    if (!productId) {
      return c.json({ error: 'Product ID is required' }, 400);
    }

    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const cart = await kv.get(`cart:${userId}`) || { items: [] };
    
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId === productId);
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }

    await kv.set(`cart:${userId}`, cart);
    
    return c.json({ success: true, cart });
  } catch (error) {
    console.log(`Add to cart error: ${error.message}`);
    return c.json({ error: 'Failed to add item to cart' }, 500);
  }
});

// Remove item from cart
app.post("/make-server-93d78077/cart/remove", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { productId } = await c.req.json();
    
    if (!productId) {
      return c.json({ error: 'Product ID is required' }, 400);
    }

    const cart = await kv.get(`cart:${userId}`) || { items: [] };
    cart.items = cart.items.filter((item: any) => item.productId !== productId);

    await kv.set(`cart:${userId}`, cart);
    
    return c.json({ success: true, cart });
  } catch (error) {
    console.log(`Remove from cart error: ${error.message}`);
    return c.json({ error: 'Failed to remove item from cart' }, 500);
  }
});

// Clear cart
app.post("/make-server-93d78077/cart/clear", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    await kv.set(`cart:${userId}`, { items: [] });
    return c.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.log(`Clear cart error: ${error.message}`);
    return c.json({ error: 'Failed to clear cart' }, 500);
  }
});

// ============ WISHLIST ROUTES ============

// Get user's wishlist
app.get("/make-server-93d78077/wishlist", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const wishlist = await kv.get(`wishlist:${userId}`) || { items: [] };
    return c.json({ success: true, wishlist });
  } catch (error) {
    console.log(`Get wishlist error: ${error.message}`);
    return c.json({ error: 'Failed to fetch wishlist' }, 500);
  }
});

// Add item to wishlist
app.post("/make-server-93d78077/wishlist/add", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { productId } = await c.req.json();
    
    if (!productId) {
      return c.json({ error: 'Product ID is required' }, 400);
    }

    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const wishlist = await kv.get(`wishlist:${userId}`) || { items: [] };
    
    if (!wishlist.items.includes(productId)) {
      wishlist.items.push(productId);
    }

    await kv.set(`wishlist:${userId}`, wishlist);
    
    return c.json({ success: true, wishlist });
  } catch (error) {
    console.log(`Add to wishlist error: ${error.message}`);
    return c.json({ error: 'Failed to add item to wishlist' }, 500);
  }
});

// Remove item from wishlist
app.post("/make-server-93d78077/wishlist/remove", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { productId } = await c.req.json();
    
    if (!productId) {
      return c.json({ error: 'Product ID is required' }, 400);
    }

    const wishlist = await kv.get(`wishlist:${userId}`) || { items: [] };
    wishlist.items = wishlist.items.filter((id: string) => id !== productId);

    await kv.set(`wishlist:${userId}`, wishlist);
    
    return c.json({ success: true, wishlist });
  } catch (error) {
    console.log(`Remove from wishlist error: ${error.message}`);
    return c.json({ error: 'Failed to remove item from wishlist' }, 500);
  }
});

// ============ ORDER ROUTES ============

// Create order
app.post("/make-server-93d78077/orders", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const orderData = await c.req.json();
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const order = {
      id: orderId,
      userId,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);
    
    // Clear cart after order
    await kv.set(`cart:${userId}`, { items: [] });
    
    return c.json({ success: true, order });
  } catch (error) {
    console.log(`Create order error: ${error.message}`);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Get user's orders
app.get("/make-server-93d78077/orders", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const allOrders = await kv.getByPrefix('order:');
    const userOrders = allOrders.filter((order: any) => order.userId === userId);
    
    return c.json({ success: true, orders: userOrders });
  } catch (error) {
    console.log(`Get orders error: ${error.message}`);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get order by ID
app.get("/make-server-93d78077/orders/:id", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    if (order.userId !== userId) {
      return c.json({ error: 'Not authorized to view this order' }, 403);
    }
    
    return c.json({ success: true, order });
  } catch (error) {
    console.log(`Get order error: ${error.message}`);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

Deno.serve(app.fetch);