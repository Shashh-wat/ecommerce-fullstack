import { Info, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: string;
  description: string;
  color: string;
}

const demoAccounts: DemoAccount[] = [
  {
    email: "buyer@demo.com",
    password: "demo123",
    name: "Demo Buyer",
    role: "Buyer",
    description: "Test shopping, cart, checkout, and orders",
    color: "bg-blue-500"
  },
  {
    email: "seller@demo.com",
    password: "demo123",
    name: "Demo Seller",
    role: "Seller",
    description: "Test product creation and management",
    color: "bg-green-500"
  },
  {
    email: "admin@demo.com",
    password: "demo123",
    name: "Demo Admin",
    role: "Admin",
    description: "Full access to all features",
    color: "bg-purple-500"
  }
];

export function DemoAccountsInfo() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <Card className="border-2 border-dashed border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader>
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <CardTitle className="text-yellow-900 dark:text-yellow-100">
              Demo Accounts Available
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Use these pre-configured accounts to test all features
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {demoAccounts.map((account) => (
          <div
            key={account.email}
            className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${account.color}`} />
                <Badge variant="outline">{account.role}</Badge>
                <span className="text-gray-600 dark:text-gray-400">{account.name}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {account.description}
            </p>
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    {account.email}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(account.email)}
                  >
                    {copiedEmail === account.email ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 dark:text-gray-400">Password:</span>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    {account.password}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(account.password)}
                  >
                    {copiedEmail === account.password ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <p>💡 <strong>Tip:</strong> Open multiple browser tabs to test different accounts simultaneously</p>
        </div>
      </CardContent>
    </Card>
  );
}
