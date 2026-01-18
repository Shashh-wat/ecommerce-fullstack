import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Trash2, Heart, ShoppingCart } from 'lucide-react';
import { wishlistAPI, cartAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../utils/AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    seller: string;
    availability: string;
  };
}

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onWishlistUpdate?: () => void;
  onCartUpdate?: () => void;
}

export function WishlistDrawer({ isOpen, onClose, onWishlistUpdate, onCartUpdate }: WishlistDrawerProps) {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await wishlistAPI.get();
      setWishlistItems(result.wishlist || []);
    } catch (error: any) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchWishlist();
    }
  }, [isOpen, isAuthenticated]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await wishlistAPI.removeItem(productId);
      toast.success('Removed from wishlist');
      fetchWishlist();
      onWishlistUpdate?.();
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (productId: string, productName: string) => {
    try {
      // Add to cart
      await cartAPI.addItem(productId, 1);
      // Remove from wishlist
      await wishlistAPI.removeItem(productId);
      
      toast.success(`${productName} moved to cart!`);
      fetchWishlist();
      onWishlistUpdate?.();
      onCartUpdate?.();
    } catch (error: any) {
      console.error('Failed to move to cart:', error);
      toast.error('Failed to move to cart');
    }
  };

  if (!isAuthenticated) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Wishlist</SheetTitle>
            <SheetDescription>Please sign in to view your wishlist</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Sign in to save your favorite items
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Wishlist</SheetTitle>
          <SheetDescription>
            {wishlistItems.length === 0 ? 'Your wishlist is empty' : `${wishlistItems.length} item(s) in your wishlist`}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Loading wishlist...</div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Your wishlist is empty
            </p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate mb-1">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground mb-1">by {item.product.seller}</p>
                    <p className="text-primary mb-3">₹{item.product.price}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleMoveToCart(item.productId, item.product.name)}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
