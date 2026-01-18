import { Info, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface DemoAccountsBannerProps {
  onNavigate: (page: string) => void;
}

export function DemoAccountsBanner({ onNavigate }: DemoAccountsBannerProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-dashed border-yellow-500 dark:border-yellow-600 rounded-lg p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="rounded-full bg-yellow-500 dark:bg-yellow-600 p-2">
            <Info className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl text-gray-900 dark:text-white mb-2">
            🎭 Try Demo Accounts
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Test the full marketplace functionality with pre-configured demo accounts. 
            Browse products, manage cart & wishlist, complete checkout, and access the seller dashboard.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <strong>buyer@demo.com</strong> - Shopping experience
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <strong>seller@demo.com</strong> - Product management
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <strong>admin@demo.com</strong> - Full access
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            All accounts use password: <code className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">demo123</code>
          </p>
          
          <Button 
            onClick={() => onNavigate('demo')}
            className="gap-2"
          >
            View Demo Guide
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
