import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { X, Filter } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  availability: string[];
}

export function ProductFilters({ onFilterChange, isMobileOpen, onMobileClose }: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  const categories = [
    { id: 'snacks', label: 'Snacks (സ്നാക്ക്സ്)' },
    { id: 'pickles', label: 'Pickles (അച്ചാറുകൾ)' },
    { id: 'handicrafts', label: 'Handicrafts (കരകൗശലവസ്തുക്കൾ)' },
    { id: 'embroidery', label: 'Embroidery (എംബ്രോയ്ഡറി)' },
    { id: 'beauty', label: 'Beauty (സൗന്ദര്യവർദ്ധക ഉൽപ്പന്നങ്ങൾ)' },
  ];

  const availabilityOptions = [
    { id: 'in-stock', label: 'In Stock' },
    { id: 'pre-order', label: 'Pre-Order' },
    { id: 'made-to-order', label: 'Made to Order' },
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId);
    setSelectedCategories(newCategories);
    updateFilters(newCategories, priceRange, selectedAvailability);
  };

  const handleAvailabilityChange = (availId: string, checked: boolean) => {
    const newAvailability = checked
      ? [...selectedAvailability, availId]
      : selectedAvailability.filter(id => id !== availId);
    setSelectedAvailability(newAvailability);
    updateFilters(selectedCategories, priceRange, newAvailability);
  };

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    updateFilters(selectedCategories, newRange, selectedAvailability);
  };

  const updateFilters = (
    categories: string[],
    price: [number, number],
    availability: string[]
  ) => {
    onFilterChange({
      categories,
      priceRange: price,
      availability,
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSelectedAvailability([]);
    onFilterChange({
      categories: [],
      priceRange: [0, 10000],
      availability: [],
    });
  };

  const activeFilterCount =
    selectedCategories.length + selectedAvailability.length + (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0);

  const filterContent = (
    <>
      {/* Header for mobile */}
      {isMobileOpen && (
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h2>Filters</h2>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onMobileClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Clear All Button */}
      {activeFilterCount > 0 && (
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full"
          >
            Clear All Filters ({activeFilterCount})
          </Button>
        </div>
      )}

      {/* Category Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.id, checked as boolean)
                }
              />
              <Label
                htmlFor={category.id}
                className="text-sm cursor-pointer leading-tight"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onValueChange={handlePriceChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availabilityOptions.map(option => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={selectedAvailability.includes(option.id)}
                onCheckedChange={(checked) =>
                  handleAvailabilityChange(option.id, checked as boolean)
                }
              />
              <Label
                htmlFor={option.id}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );

  if (isMobileOpen) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4 lg:hidden">
        {filterContent}
      </div>
    );
  }

  return <div className="space-y-4">{filterContent}</div>;
}
