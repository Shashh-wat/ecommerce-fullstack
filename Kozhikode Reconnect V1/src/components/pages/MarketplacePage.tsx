import { ShoppingBag, Star, Search, SlidersHorizontal, Heart } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CategoryImage } from '../CategoryImages';
import { ProductFilters, FilterState } from '../ProductFilters';
import { useState, useEffect } from 'react';
import { productAPI, cartAPI, wishlistAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';
import { toast } from 'sonner@2.0.3';
import { AuthModal } from '../AuthModal';

const marketplaceHeroImage = "https://images.unsplash.com/photo-1744668972836-eb6d97a23c1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLZXJhbGElMjBzcGljZSUyMG1hcmtldCUyMGJhemFhcnxlbnwxfHx8fDE3NjMyMzQ4Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

interface Product {
  id: string;
  name: string;
  malayalamName?: string;
  category: string;
  categoryDisplay?: string;
  price: number;
  priceDisplay: string;
  rating?: number;
  seller: string;
  availability: string;
  image: string;
}

interface MarketplacePageProps {
  onCartUpdate?: () => void;
  onWishlistUpdate?: () => void;
}

export function MarketplacePage({ onCartUpdate, onWishlistUpdate }: MarketplacePageProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 10000],
    availability: [],
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, refreshAuth } = useAuth();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await productAPI.getAll();
        // Map backend products to frontend format
        const mappedProducts = result.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          malayalamName: p.malayalamName,
          category: p.category,
          categoryDisplay: p.categoryDisplay,
          price: p.price,
          priceDisplay: `₹${p.price.toLocaleString('en-IN')}`,
          rating: p.rating || 4.5,
          seller: p.seller,
          availability: p.availability || 'in-stock',
          image: p.image,
        }));
        setProducts(mappedProducts);
      } catch (error: any) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    {
      id: 'snacks',
      name: 'Snacks (സ്നാക്ക്സ്)',
      icon: '🍪',
      description: 'Traditional Kozhikode snacks and treats',
      count: products.filter(p => p.category === 'snacks').length,
    },
    {
      id: 'pickles',
      name: 'Pickles (അച്ചാറുകൾ)',
      icon: '🥒',
      description: 'Authentic homemade pickles',
      count: products.filter(p => p.category === 'pickles').length,
    },
    {
      id: 'handicrafts',
      name: 'Handicrafts (കരകൗശലവസ്തുക്കൾ)',
      icon: '🎨',
      description: 'Handcrafted items and decor',
      count: products.filter(p => p.category === 'handicrafts').length,
    },
    {
      id: 'embroidery',
      name: 'Embroidery (എംബ്രോയ്ഡറി)',
      icon: '🧵',
      description: 'Beautiful embroidered textiles',
      count: products.filter(p => p.category === 'embroidery').length,
    },
    {
      id: 'beauty',
      name: 'Beauty (സൗന്ദര്യവർദ്ധക ഉൽപ്പന്നങ്ങൾ)',
      icon: '💄',
      description: 'Natural beauty and wellness products',
      count: products.filter(p => p.category === 'beauty').length,
    },
  ];

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter from sidebar
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }

    // Category filter from category cards
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }

    // Price range filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }

    // Availability filter
    if (filters.availability.length > 0 && !filters.availability.includes(product.availability)) {
      return false;
    }

    return true;
  });

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      await cartAPI.addItem(product.id, 1);
      toast.success(`${product.name} added to cart!`);
      onCartUpdate?.();
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    try {
      await wishlistAPI.addItem(product.id);
      toast.success(`${product.name} added to wishlist!`);
      onWishlistUpdate?.();
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error);
      toast.error(error.message || 'Failed to add to wishlist');
    }
  };

  return (
    <div>
      {/* Hero with Background */}
      <section className="relative h-[350px] md:h-[450px] overflow-hidden mb-12">
        <div className="absolute inset-0">
          <img 
            src={marketplaceHeroImage} 
            alt="Indian Marketplace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="max-w-3xl mx-auto text-center text-white mb-8">
            <h1 className="font-serif text-4xl md:text-5xl mb-4 drop-shadow-lg">Marketplace</h1>
            <p className="text-lg drop-shadow-md mb-8">
              Discover authentic products from Kozhikode's finest artisans and sellers
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search categories or products..."
                className="pl-10 bg-white text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="font-serif text-2xl mb-6 text-center md:text-left">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCategory === category.id
                  ? 'border-2 border-primary'
                  : 'border-2 border-border hover:border-primary/50'
              }`}
              onClick={() =>
                setSelectedCategory(selectedCategory === category.id ? null : category.id)
              }
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <CategoryImage 
                      category={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3>{category.name}</h3>
                      <Badge variant="secondary" className="ml-2">
                        {category.count}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl">Featured Products</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block">
            <ProductFilters onFilterChange={setFilters} />
          </div>

          {/* Mobile Filter Overlay */}
          {isMobileFilterOpen && (
            <ProductFilters
              onFilterChange={setFilters}
              isMobileOpen={isMobileFilterOpen}
              onMobileClose={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No products found matching your filters.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({
                          categories: [],
                          priceRange: [0, 10000],
                          availability: [],
                        });
                        setSelectedCategory(null);
                        setSearchQuery('');
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <div className="h-48 overflow-hidden relative">
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            {product.availability === 'pre-order' && (
                              <Badge className="absolute top-2 right-2 bg-orange-500">Pre-Order</Badge>
                            )}
                            {product.availability === 'made-to-order' && (
                              <Badge className="absolute top-2 right-2 bg-blue-500">Made to Order</Badge>
                            )}
                            {/* Wishlist Button */}
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute top-2 left-2 h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToWishlist(product);
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="flex-1">{product.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">by {product.seller}</p>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-primary">{product.priceDisplay}</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-secondary text-secondary" />
                                <span className="text-sm">{product.rating}</span>
                              </div>
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {selectedCategory && (
          <div className="text-center mt-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-primary hover:underline"
            >
              View all categories
            </button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 mt-16">
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h3 className="font-serif text-2xl mb-3 text-primary">Can't find what you're looking for?</h3>
          <p className="text-muted-foreground mb-6">
            New products are added regularly. Check back soon or contact us with your request!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Request a Product
            </button>
            <button className="px-6 py-2 border-2 border-border rounded-md hover:border-primary transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={refreshAuth}
      />
    </div>
  );
}
