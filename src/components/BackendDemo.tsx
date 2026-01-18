import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { authAPI, productAPI, cartAPI, wishlistAPI } from '../utils/api';
import { seedProducts } from '../utils/seedProducts';

export function BackendDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(authAPI.getCurrentUser());
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any>(null);
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await authAPI.signup(email, password, name);
      setMessage(`✓ Signup successful! User ID: ${result.userId}`);
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      setMessage(`✗ Signup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await authAPI.signin(email, password);
      setUser(result.user);
      setMessage(`✓ Welcome back, ${result.user.name || result.user.email}!`);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMessage(`✗ Sign in failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignout = async () => {
    setLoading(true);
    try {
      await authAPI.signout();
      setUser(null);
      setCart(null);
      setWishlist(null);
      setMessage('✓ Signed out successfully');
    } catch (error: any) {
      setMessage(`✗ Sign out failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProducts = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await seedProducts();
      if (result.success) {
        setMessage(`✓ ${result.message} Check the console for details.`);
      } else {
        setMessage(`✗ Seeding failed: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`✗ Seeding failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProducts = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await productAPI.getAll();
      setProducts(result.products || []);
      setMessage(`✓ Fetched ${result.products?.length || 0} products`);
    } catch (error: any) {
      setMessage(`✗ Failed to fetch products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCart = async () => {
    if (!user) {
      setMessage('✗ Please sign in first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const result = await cartAPI.get();
      setCart(result.cart);
      setMessage(`✓ Cart has ${result.cart.items?.length || 0} items`);
    } catch (error: any) {
      setMessage(`✗ Failed to fetch cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchWishlist = async () => {
    if (!user) {
      setMessage('✗ Please sign in first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const result = await wishlistAPI.get();
      setWishlist(result.wishlist);
      setMessage(`✓ Wishlist has ${result.wishlist.items?.length || 0} items`);
    } catch (error: any) {
      setMessage(`✗ Failed to fetch wishlist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      setMessage('✗ Please sign in first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const result = await cartAPI.addItem(productId, 1);
      setCart(result.cart);
      setMessage('✓ Added to cart!');
    } catch (error: any) {
      setMessage(`✗ Failed to add to cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!user) {
      setMessage('✗ Please sign in first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const result = await wishlistAPI.addItem(productId);
      setWishlist(result.wishlist);
      setMessage('✓ Added to wishlist!');
    } catch (error: any) {
      setMessage(`✗ Failed to add to wishlist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="font-serif text-3xl mb-4">Backend Demo & Testing</h1>
      
      {message && (
        <div className={`p-4 rounded-lg ${message.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* User Status */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <Button onClick={handleSignout} variant="destructive" className="mt-4" disabled={loading}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Authentication */}
      {!user && (
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name (optional for signin)</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSignup} disabled={loading || !email || !password}>
                Sign Up
              </Button>
              <Button onClick={handleSignin} variant="outline" disabled={loading || !email || !password}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Management */}
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleSeedProducts} disabled={loading}>
              Seed Sample Products
            </Button>
            <Button onClick={handleFetchProducts} variant="outline" disabled={loading}>
              Fetch All Products
            </Button>
          </div>
          
          {products.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2">Products ({products.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.priceDisplay}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAddToCart(product.id)}
                            disabled={!user || loading}
                          >
                            Add to Cart
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddToWishlist(product.id)}
                            disabled={!user || loading}
                          >
                            Wishlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cart & Wishlist */}
      {user && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleFetchCart} disabled={loading} className="mb-4">
                Fetch Cart
              </Button>
              {cart && (
                <div>
                  <p className="mb-2"><strong>Items:</strong> {cart.items?.length || 0}</p>
                  {cart.items?.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm p-2 bg-muted rounded mb-2">
                      Product ID: {item.productId} - Qty: {item.quantity}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleFetchWishlist} disabled={loading} className="mb-4">
                Fetch Wishlist
              </Button>
              {wishlist && (
                <div>
                  <p className="mb-2"><strong>Items:</strong> {wishlist.items?.length || 0}</p>
                  {wishlist.items?.map((productId: string, idx: number) => (
                    <div key={idx} className="text-sm p-2 bg-muted rounded mb-2">
                      Product ID: {productId}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documentation Link */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="mb-2">📚 Full Documentation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Check <code>BACKEND_README.md</code> for complete API documentation, 
            security features, and integration guides.
          </p>
          <p className="text-sm">
            <strong>Quick Start:</strong> Click "Seed Sample Products" to populate the database, 
            then create an account to test cart and wishlist features!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}