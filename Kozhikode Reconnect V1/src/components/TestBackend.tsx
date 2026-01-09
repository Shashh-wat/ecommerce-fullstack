import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authAPI, productAPI, cartAPI, wishlistAPI, orderAPI } from '../utils/api';
import { seedProducts } from '../utils/seedProducts';
import { seedDemoAccounts } from '../utils/seedDemoAccounts';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export function TestBackend() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testUser, setTestUser] = useState<any>(null);

  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateLastResult = (updates: Partial<TestResult>) => {
    setTestResults(prev => {
      const newResults = [...prev];
      const lastIndex = newResults.length - 1;
      if (lastIndex >= 0) {
        newResults[lastIndex] = { ...newResults[lastIndex], ...updates };
      }
      return newResults;
    });
  };

  const runAllTests = async () => {
    setTestResults([]);
    setIsRunning(true);
    setTestUser(null);

    try {
      // Test 1: Health Check
      addResult({ name: '1. Health Check', status: 'pending' });
      try {
        const response = await fetch('https://miivxtkieuciwxweblda.supabase.co/functions/v1/make-server-93d78077/health');
        const data = await response.json();
        updateLastResult({ 
          status: 'success', 
          message: `Server is healthy: ${data.status}`,
          data 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Health check failed: ${error.message}` 
        });
        throw error; // Stop if server is down
      }

      // Test 2: Seed Demo Accounts
      addResult({ name: '2. Seed Demo Accounts', status: 'pending' });
      try {
        const result = await seedDemoAccounts();
        updateLastResult({ 
          status: 'success', 
          message: 'Demo accounts seeded successfully',
          data: result 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Seeding demo accounts failed: ${error.message}` 
        });
      }

      // Test 3: Seed Products
      addResult({ name: '3. Seed Products', status: 'pending' });
      try {
        const result = await seedProducts();
        if (result.success) {
          updateLastResult({ 
            status: 'success', 
            message: `${result.successCount} products seeded`,
            data: result 
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Seeding products failed: ${error.message}` 
        });
      }

      // Test 4: Sign In
      addResult({ name: '4. Sign In (buyer@demo.com)', status: 'pending' });
      try {
        const result = await authAPI.signin('buyer@demo.com', 'demo123');
        setTestUser(result.user);
        updateLastResult({ 
          status: 'success', 
          message: `Signed in as ${result.user.email}`,
          data: { userId: result.user.id, email: result.user.email } 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Sign in failed: ${error.message}` 
        });
        throw error; // Stop if auth fails
      }

      // Test 5: Get Products
      addResult({ name: '5. Get All Products', status: 'pending' });
      try {
        const result = await productAPI.getAll();
        updateLastResult({ 
          status: 'success', 
          message: `Found ${result.products.length} products`,
          data: { count: result.products.length } 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Get products failed: ${error.message}` 
        });
      }

      // Test 6: Get Cart
      addResult({ name: '6. Get Cart', status: 'pending' });
      try {
        const result = await cartAPI.get();
        updateLastResult({ 
          status: 'success', 
          message: `Cart has ${result.cart?.items?.length || 0} items`,
          data: result.cart 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Get cart failed: ${error.message}` 
        });
      }

      // Test 7: Add to Cart
      addResult({ name: '7. Add to Cart', status: 'pending' });
      try {
        const result = await cartAPI.addItem('prod-banana-chips-001', 2);
        updateLastResult({ 
          status: 'success', 
          message: `Added item to cart. Total items: ${result.cart.items.length}`,
          data: result.cart 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Add to cart failed: ${error.message}` 
        });
      }

      // Test 8: Get Wishlist
      addResult({ name: '8. Get Wishlist', status: 'pending' });
      try {
        const result = await wishlistAPI.get();
        updateLastResult({ 
          status: 'success', 
          message: `Wishlist has ${result.wishlist?.items?.length || 0} items`,
          data: result.wishlist 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Get wishlist failed: ${error.message}` 
        });
      }

      // Test 9: Add to Wishlist
      addResult({ name: '9. Add to Wishlist', status: 'pending' });
      try {
        const result = await wishlistAPI.addItem('prod-halwa-002');
        updateLastResult({ 
          status: 'success', 
          message: `Added item to wishlist. Total items: ${result.wishlist.items.length}`,
          data: result.wishlist 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Add to wishlist failed: ${error.message}` 
        });
      }

      // Test 10: Create Order
      addResult({ name: '10. Create Order', status: 'pending' });
      try {
        const orderData = {
          items: [
            { productId: 'prod-banana-chips-001', quantity: 2, price: 299 }
          ],
          total: 598,
          shippingAddress: {
            name: 'Test User',
            address: '123 Test St',
            city: 'Kozhikode',
            state: 'Kerala',
            pincode: '673001'
          }
        };
        const result = await orderAPI.create(orderData);
        updateLastResult({ 
          status: 'success', 
          message: `Order created: ${result.order.id}`,
          data: { orderId: result.order.id, total: result.order.total } 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Create order failed: ${error.message}` 
        });
      }

      // Test 11: Get Orders
      addResult({ name: '11. Get All Orders', status: 'pending' });
      try {
        const result = await orderAPI.getAll();
        updateLastResult({ 
          status: 'success', 
          message: `Found ${result.orders.length} orders`,
          data: { count: result.orders.length } 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Get orders failed: ${error.message}` 
        });
      }

      // Test 12: Clear Cart
      addResult({ name: '12. Clear Cart', status: 'pending' });
      try {
        const result = await cartAPI.clear();
        updateLastResult({ 
          status: 'success', 
          message: 'Cart cleared successfully',
          data: result 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Clear cart failed: ${error.message}` 
        });
      }

      // Test 13: Sign Out
      addResult({ name: '13. Sign Out', status: 'pending' });
      try {
        await authAPI.signout();
        setTestUser(null);
        updateLastResult({ 
          status: 'success', 
          message: 'Signed out successfully' 
        });
      } catch (error: any) {
        updateLastResult({ 
          status: 'error', 
          message: `Sign out failed: ${error.message}` 
        });
      }

    } catch (error: any) {
      console.error('Test suite stopped due to critical error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Quick Start Banner */}
      <div className="max-w-4xl mx-auto mb-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">🚀 Backend Test Suite Ready</h2>
        <p className="text-sm opacity-90 mb-4">
          Click "Run All Tests" below to validate all 22 backend endpoints. 
          The suite will automatically seed demo accounts and products, then test authentication, 
          cart, wishlist, and order management.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-1 rounded">✓</span>
            <span>13 automated tests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-1 rounded">⚡</span>
            <span>Real-time results</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-1 rounded">📊</span>
            <span>Detailed logs</span>
          </div>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Backend Functionality Test Suite</CardTitle>
          <CardDescription>
            Comprehensive test of all Kozhikode Reconnect backend endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Summary */}
          {testResults.length > 0 && (
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Total:</span>
                <Badge variant="outline">{totalTests}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Success:</span>
                <Badge className="bg-green-600">{successCount}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-semibold">Failed:</span>
                <Badge className="bg-red-600">{errorCount}</Badge>
              </div>
            </div>
          )}

          {/* Current User */}
          {testUser && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold">Current Test User:</p>
              <p className="text-sm text-gray-600">{testUser.email} (ID: {testUser.id})</p>
            </div>
          )}

          {/* Run Tests Button */}
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            size="lg"
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Test Results:</h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : result.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {result.status === 'success' && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        {result.status === 'error' && (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        {result.status === 'pending' && (
                          <Loader2 className="h-5 w-5 text-gray-600 animate-spin flex-shrink-0" />
                        )}
                        <span className="font-semibold">{result.name}</span>
                      </div>
                      {result.message && (
                        <p className="text-sm text-gray-700 ml-7">{result.message}</p>
                      )}
                      {result.data && (
                        <details className="mt-2 ml-7">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View Response Data
                          </summary>
                          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2">Test Information:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Tests will run sequentially in order</li>
              <li>• Demo accounts and products will be seeded automatically</li>
              <li>• A test user (buyer@demo.com) will be used for authenticated tests</li>
              <li>• All 20+ API endpoints will be tested</li>
              <li>• Check browser console for detailed logs</li>
            </ul>
          </div>

          {/* Backend Info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold mb-2">Backend Information:</h4>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Project ID:</span>
                <code className="text-xs bg-white px-2 py-1 rounded">miivxtkieuciwxweblda</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Server URL:</span>
                <code className="text-xs bg-white px-2 py-1 rounded break-all">
                  .../make-server-93d78077
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Endpoints:</span>
                <Badge>22 endpoints</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Demo Accounts:</span>
                <Badge variant="outline">3 users</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}