import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Chatbot } from './components/Chatbot';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { MarketplacePage } from './components/pages/MarketplacePage';
import { SellerPage } from './components/pages/SellerPage';
import { ContactPage } from './components/pages/ContactPage';
import { BackendDemo } from './components/BackendDemo';
import { TestBackend } from './components/TestBackend';
import { CheckoutPage } from './components/pages/CheckoutPage';
import { OrdersPage } from './components/pages/OrdersPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { SellerDashboard } from './components/pages/SellerDashboard';
import { DemoPage } from './pages/DemoPage';
import { PitchDeck } from './components/PitchDeck';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Toaster } from './components/ui/sonner';
import { cartAPI, wishlistAPI } from './utils/api';
import { seedDemoAccounts } from './utils/seedDemoAccounts';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { isAuthenticated, isLoading } = useAuth();

  // Seed demo accounts on first load
  useEffect(() => {
    // Always try to seed on load for better error visibility
    seedDemoAccounts().then((success) => {
      if (success) {
        console.log('✅ Demo accounts are ready');
      } else {
        console.log('⚠️ Demo accounts seeding had issues - check console for details');
      }
    });
  }, []);

  // Fetch cart and wishlist counts
  const updateCounts = async () => {
    // Don't fetch if still loading auth state or not authenticated
    if (isLoading || !isAuthenticated) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    // Double-check we have a valid token before making API calls
    const token = localStorage.getItem('authToken');
    if (!token) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    try {
      const [cartResult, wishlistResult] = await Promise.all([
        cartAPI.get(),
        wishlistAPI.get(),
      ]);
      
      setCartCount(cartResult.cart?.length || 0);
      setWishlistCount(wishlistResult.wishlist?.length || 0);
    } catch (error: any) {
      // Silently handle all authentication errors
      const errorMessage = error.message || '';
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('HTTP error! status: 401')) {
        // Completely silent - no logging for auth errors
        setCartCount(0);
        setWishlistCount(0);
      } else {
        // Only log non-auth errors
        console.error('Failed to fetch counts:', error);
      }
    }
  };

  useEffect(() => {
    // Only run after auth has finished loading
    if (!isLoading) {
      updateCounts();
    }
  }, [isAuthenticated, isLoading]);

  const renderPage = () => {
    // Special case: pitch deck is fullscreen
    if (currentPage === 'pitch') {
      return <PitchDeck onExit={() => setCurrentPage('home')} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'marketplace':
        return (
          <MarketplacePage
            onCartUpdate={updateCounts}
            onWishlistUpdate={updateCounts}
          />
        );
      case 'seller':
        return <SellerPage onNavigate={setCurrentPage} />;
      case 'contact':
        return <ContactPage />;
      case 'backend-demo':
        return <BackendDemo />;
      case 'test-backend':
        return <TestBackend />;
      case 'demo':
        return <DemoPage />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      case 'orders':
        return <OrdersPage onNavigate={setCurrentPage} />;
      case 'checkout':
        return <CheckoutPage onNavigate={setCurrentPage} />;
      case 'seller-dashboard':
        return <SellerDashboard onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer onNavigate={setCurrentPage} />
      <Chatbot />
      
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setCurrentPage('checkout');
          setIsCartOpen(false);
        }}
        onCartUpdate={updateCounts}
      />
      
      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onWishlistUpdate={updateCounts}
        onCartUpdate={updateCounts}
      />
      
      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}