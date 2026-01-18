import { ArrowRight, ShoppingCart, Store, Shield, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { DemoAccountsInfo } from "../components/DemoAccountsInfo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function DemoPage() {
  const testingScenarios = [
    {
      title: "Complete Purchase Flow",
      icon: ShoppingCart,
      steps: [
        "Sign in with buyer@demo.com",
        "Browse and search products",
        "Add items to cart and wishlist",
        "Proceed to checkout",
        "Complete order and view history"
      ]
    },
    {
      title: "Seller Product Management",
      icon: Store,
      steps: [
        "Sign in with seller@demo.com",
        "Access Seller Dashboard",
        "Create a new product",
        "Edit and manage products",
        "View in marketplace"
      ]
    },
    {
      title: "Multi-User Experience",
      icon: Shield,
      steps: [
        "Create product as seller",
        "Switch to buyer account",
        "Purchase the product",
        "Switch back to seller",
        "View the order"
      ]
    }
  ];

  const features = [
    { name: "User Authentication", status: "Sign up, sign in, sign out, sessions" },
    { name: "Product Browsing", status: "Search, filter, view details" },
    { name: "Shopping Cart", status: "Add, update, remove items" },
    { name: "Wishlist", status: "Save favorite products" },
    { name: "Checkout", status: "Complete order flow" },
    { name: "Order History", status: "View past orders" },
    { name: "Seller Dashboard", status: "Manage products" },
    { name: "Profile Management", status: "Update user info" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl text-gray-900 dark:text-white">
            🎭 Demo Accounts & Testing Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the full functionality of Kozhikode Reconnect marketplace with pre-configured demo accounts
          </p>
        </div>

        {/* Demo Accounts Card */}
        <DemoAccountsInfo />

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Available Features</CardTitle>
            <CardDescription>
              All features are fully functional and connected to the backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-900 dark:text-white">{feature.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing Scenarios */}
        <div className="space-y-4">
          <h2 className="text-2xl text-gray-900 dark:text-white">
            🧪 Recommended Testing Scenarios
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testingScenarios.map((scenario, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <scenario.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {scenario.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                          {stepIndex + 1}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 pt-0.5">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-2">
                  Ready to test?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Visit the marketplace to start exploring with demo accounts
                </p>
              </div>
              <Button size="lg" className="gap-2" asChild>
                <a href="/marketplace">
                  Go to Marketplace
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Technical Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-gray-900 dark:text-white mb-3">Frontend</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• React + TypeScript</li>
                  <li>• Tailwind CSS styling</li>
                  <li>• shadcn/ui components</li>
                  <li>• Lucide React icons</li>
                </ul>
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white mb-3">Backend</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Supabase Edge Functions</li>
                  <li>• Hono web framework</li>
                  <li>• KV Store database</li>
                  <li>• JWT authentication</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
          <h3 className="text-blue-900 dark:text-blue-100">📝 Important Notes</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• All accounts use the password: <code className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900">demo123</code></li>
            <li>• Email confirmation is disabled for demo accounts (auto-confirmed)</li>
            <li>• Sessions persist until you sign out</li>
            <li>• Open multiple tabs to test different accounts simultaneously</li>
            <li>• Check browser console for detailed error messages if issues occur</li>
            <li>• All data is stored in Supabase and persists between sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
