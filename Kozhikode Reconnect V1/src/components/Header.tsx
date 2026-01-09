import { useState } from 'react';
import { Menu, X, Search, User, Heart, ShoppingCart, LogOut, Package, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '../utils/AuthContext';
import { AuthModal } from './AuthModal';
import logoImage from 'figma:asset/361787eed9f2a2d235d24f4b5259c2b2c2b45673.png';
import { toast } from 'sonner@2.0.3';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

export function Header({ currentPage, onNavigate, onOpenCart, onOpenWishlist, cartCount = 0, wishlistCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const { user, isAuthenticated, refreshAuth, signOut } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'seller', label: 'Become a Seller' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3"
            >
              <img 
                src={logoImage} 
                alt="Kozhikode Collage" 
                className="h-12 w-12 object-cover rounded-lg shadow-sm"
              />
              <div className="hidden sm:block">
                <h1 className="font-serif text-lg sm:text-xl text-primary">Kozhikode Reconnect</h1>
                <p className="text-xs text-muted-foreground">Revival Hub</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`transition-colors ${
                    currentPage === item.id
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                onClick={() => onNavigate('marketplace')}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* User Menu - Desktop */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden sm:flex"
                    >
                      <UserCircle className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex"
                  onClick={() => openAuthModal('signin')}
                >
                  <User className="w-5 h-5" />
                </Button>
              )}

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex relative"
                onClick={onOpenWishlist}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={onOpenCart}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded-md transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Action Buttons */}
              <div className="flex gap-2 pt-2 px-2 sm:hidden">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onNavigate('marketplace');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <UserCircle className="w-4 h-4 mr-2" />
                        {user?.name?.split(' ')[0] || 'Account'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { onNavigate('orders'); setMobileMenuOpen(false); }}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      openAuthModal('signin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                )}
              </div>
              <div className="flex gap-2 px-2 sm:hidden">
                <Button
                  variant="outline"
                  className="flex-1 relative"
                  onClick={() => {
                    onOpenWishlist?.();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <Badge 
                      className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      variant="destructive"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
        onAuthSuccess={refreshAuth}
      />
    </>
  );
}
