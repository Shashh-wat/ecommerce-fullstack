import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { productAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Plus, Edit, Trash2, Package, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  malayalamName?: string;
  category: string;
  price: number;
  seller: string;
  availability: string;
  image: string;
  description?: string;
}

interface SellerDashboardProps {
  onNavigate?: (page: string) => void;
}

export function SellerDashboard({ onNavigate }: SellerDashboardProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    malayalamName: '',
    category: 'snacks',
    price: '',
    availability: 'in-stock',
    image: '',
    description: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const result = await productAPI.getAll();
      // Filter products by current user (seller)
      const userProducts = result.products.filter(
        (p: Product) => p.seller === user?.name || p.seller === user?.email
      );
      setProducts(userProducts);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await productAPI.create({
        ...newProduct,
        price: parseFloat(newProduct.price),
        seller: user?.name || user?.email || 'Unknown Seller',
        rating: 0,
        priceDisplay: `₹${parseFloat(newProduct.price)}`,
      });

      toast.success('Product added successfully!');
      setIsAddDialogOpen(false);
      setNewProduct({
        name: '',
        malayalamName: '',
        category: 'snacks',
        price: '',
        availability: 'in-stock',
        image: '',
        description: '',
      });
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast.error(error.message || 'Failed to add product');
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      await productAPI.update(editingProduct.id, {
        name: editingProduct.name,
        malayalamName: editingProduct.malayalamName,
        category: editingProduct.category,
        price: editingProduct.price,
        availability: editingProduct.availability,
        image: editingProduct.image,
        description: editingProduct.description,
      });

      toast.success('Product updated successfully!');
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(id);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Revenue',
      value: `₹${products.reduce((sum, p) => sum + p.price, 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Listings',
      value: products.filter(p => p.availability === 'in-stock').length,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and track sales</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the details to list a new product</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g., Banana Chips Premium Pack"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="malayalamName">Malayalam Name</Label>
                    <Input
                      id="malayalamName"
                      value={newProduct.malayalamName}
                      onChange={(e) => setNewProduct({ ...newProduct, malayalamName: e.target.value })}
                      placeholder="e.g., ബനാന ചിപ്സ്"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="snacks">Snacks</SelectItem>
                        <SelectItem value="pickles">Pickles</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                        <SelectItem value="handicrafts">Handicrafts</SelectItem>
                        <SelectItem value="embroidery">Embroidery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="299"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability *</Label>
                  <Select
                    value={newProduct.availability}
                    onValueChange={(value) => setNewProduct({ ...newProduct, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="pre-order">Pre-Order</SelectItem>
                      <SelectItem value="made-to-order">Made to Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL *</Label>
                  <Input
                    id="image"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Describe your product..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddProduct} className="flex-1">Add Product</Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>Manage your product listings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-serif text-xl mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first product</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="truncate max-w-xs">{product.name}</p>
                              {product.malayalamName && (
                                <p className="text-sm text-muted-foreground">{product.malayalamName}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>
                          <Badge
                            variant={product.availability === 'in-stock' ? 'default' : 'secondary'}
                          >
                            {product.availability}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        {editingProduct && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>Update product details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Malayalam Name</Label>
                    <Input
                      value={editingProduct.malayalamName || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, malayalamName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editingProduct.category}
                      onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="snacks">Snacks</SelectItem>
                        <SelectItem value="pickles">Pickles</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                        <SelectItem value="handicrafts">Handicrafts</SelectItem>
                        <SelectItem value="embroidery">Embroidery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select
                    value={editingProduct.availability}
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="pre-order">Pre-Order</SelectItem>
                      <SelectItem value="made-to-order">Made to Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleEditProduct} className="flex-1">Update Product</Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
