// This file contains a function to seed the database with initial products
// You can call this from your app to populate the marketplace

import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-93d78077`;

// Simple function to seed products without authentication (for demo purposes)
export const seedProducts = async () => {
  try {
    console.log('Starting product seeding process...');
    console.log('Backend URL:', BASE_URL);
    
    // First, test if the backend is accessible
    try {
      console.log('Testing backend connection...');
      const healthResponse = await fetch(`${BASE_URL}/health`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (!healthResponse.ok) {
        console.error('Backend health check failed:', healthResponse.status);
        return { 
          success: false, 
          error: `Backend is not responding (Status: ${healthResponse.status}). Please wait a moment and try again.` 
        };
      }
      
      const healthData = await healthResponse.json();
      console.log('✓ Backend is healthy:', healthData);
    } catch (healthError: any) {
      console.error('Backend connection error:', healthError);
      return { 
        success: false, 
        error: `Cannot connect to backend: ${healthError.message}. The server may be starting up, please wait 30 seconds and try again.` 
      };
    }

    const products = [
      {
        id: 'prod-banana-chips-001',
        name: 'Banana Chips Premium Pack (ബനാന ചിപ്സ്)',
        category: 'snacks',
        categoryDisplay: 'Snacks (സ്നാക്ക്സ്)',
        price: 299,
        priceDisplay: '₹299',
        rating: 4.8,
        seller: 'Kerala Snacks Co.',
        sellerId: 'demo-seller-001',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1619028005538-db42565dd583?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5hbmElMjBjaGlwc3xlbnwxfHx8fDE3NTk3NTc2MjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Crispy and delicious premium banana chips made from the finest Kerala bananas.',
      },
      {
        id: 'prod-halwa-002',
        name: 'Halwa Special (ഹൽവ)',
        category: 'snacks',
        categoryDisplay: 'Snacks (സ്നാക്ക്സ്)',
        price: 450,
        priceDisplay: '₹450',
        rating: 4.9,
        seller: 'Sweet Traditions',
        sellerId: 'demo-seller-002',
        availability: 'pre-order',
        image: 'https://images.unsplash.com/photo-1723648722809-65f1e11e5060?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWx3YSUyMHN3ZWV0JTIwaW5kaWFufGVufDF8fHx8MTc1OTc1NzYxOXww&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Traditional Kozhikode halwa made with authentic recipes passed down through generations.',
      },
      {
        id: 'prod-murukku-003',
        name: 'Murukku Homemade (മുറുക്ക്)',
        category: 'snacks',
        categoryDisplay: 'Snacks (സ്നാക്ക്സ്)',
        price: 199,
        priceDisplay: '₹199',
        rating: 4.7,
        seller: 'Homemade Snacks Kerala',
        sellerId: 'demo-seller-003',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1731329576495-3cf5f708c8fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLZXJhbGElMjBtdXJ1a2t1JTIwc25hY2tzfGVufDF8fHx8MTc2MzE0MTUxMHww&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Handmade crispy murukku with perfect spices, a Kerala favorite snack.',
      },
      {
        id: 'prod-payasam-004',
        name: 'Kerala Payasam Mix (പായസം മിക്സ്)',
        category: 'snacks',
        categoryDisplay: 'Snacks (സ്നാക്ക്സ്)',
        price: 350,
        priceDisplay: '₹350',
        rating: 4.8,
        seller: 'Traditional Sweets',
        sellerId: 'demo-seller-004',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1663136618135-d11b4dbd22c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLZXJhbGElMjBwYXlhc2FtJTIwc3dlZXR8ZW58MXx8fHwxNzYzMTQxNTExfDA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Premium payasam mix for authentic Kerala dessert experience.',
      },
      {
        id: 'prod-mango-pickle-005',
        name: 'Mango Pickle Traditional (മാങ്ങ അച്ചാർ)',
        category: 'pickles',
        categoryDisplay: 'Pickles (അച്ചാറുകൾ)',
        price: 249,
        priceDisplay: '₹249',
        rating: 4.9,
        seller: 'Homemade Delights',
        sellerId: 'demo-seller-005',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1617854307432-13950e24ba07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMHBpY2tlsZSUyMGluZGlhbnxlbnwxfHx8fDE3NTk3NTc2MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Tangy and spicy mango pickle made with traditional Kerala recipe.',
      },
      {
        id: 'prod-lemon-pickle-006',
        name: 'Lemon Pickle Spicy (നാരങ്ങ അച്ചാർ)',
        category: 'pickles',
        categoryDisplay: 'Pickles (അച്ചാറുകൾ)',
        price: 199,
        priceDisplay: '₹199',
        rating: 4.6,
        seller: 'Homemade Pickles Kerala',
        sellerId: 'demo-seller-006',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1583118289889-f9e5ee78c82a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBsZW1vbiUyMHBpY2tlsZXxlbnwxfHx8fDE3NjMxNDE1MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Authentic lemon pickle with the perfect blend of spices.',
      },
      {
        id: 'prod-garlic-pickle-007',
        name: 'Garlic Pickle Traditional (വെളുത്തുള്ളി അച്ചാർ)',
        category: 'pickles',
        categoryDisplay: 'Pickles (അച്ചാറുകൾ)',
        price: 229,
        priceDisplay: '₹229',
        rating: 4.7,
        seller: 'Authentic Pickles Co.',
        sellerId: 'demo-seller-007',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1531170810185-442d4b10ebce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBnYXJsaWMlMjBwaWNrbGV8ZW58MXx8fHwxNzYzMTQxNTExfDA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Homemade garlic pickle with authentic Kerala spices.',
      },
      {
        id: 'prod-coconut-oil-008',
        name: 'Coconut Oil Organic (വെളിച്ചെണ്ണ)',
        category: 'beauty',
        categoryDisplay: 'Beauty (സൗന്ദര്യവർദ്ധക ഉൽപ്പന്നങ്ങൾ)',
        price: 399,
        priceDisplay: '₹399',
        rating: 4.7,
        seller: 'Natural Wellness',
        sellerId: 'demo-seller-008',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwb2lsJTIwYm90dGxlfGVufDF8fHx8MTc1OTczMjA2MHww&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Pure organic coconut oil for hair and skin care.',
      },
      {
        id: 'prod-ayurvedic-soap-009',
        name: 'Ayurvedic Soap Natural (ആയുർവേദ സോപ്പ്)',
        category: 'beauty',
        categoryDisplay: 'Beauty (സൗന്ദര്യവർദ്ധക ഉൽപ്പന്നങ്ങൾ)',
        price: 149,
        priceDisplay: '₹149',
        rating: 4.8,
        seller: 'Herbal Beauty Products',
        sellerId: 'demo-seller-009',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1663108221456-1d905f3c6a9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwYXl1cnZlZGljJTIwc29hcHxlbnwxfHx8fDE3NjMxNDE1MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Natural ayurvedic soap with traditional herbal ingredients.',
      },
      {
        id: 'prod-hair-oil-010',
        name: 'Herbal Hair Oil (ഹെയർ ഓയിൽ)',
        category: 'beauty',
        categoryDisplay: 'Beauty (സൗന്ദര്യവർദ്ധക ഉൽപ്പന്നങ്ങൾ)',
        price: 299,
        priceDisplay: '₹299',
        rating: 4.6,
        seller: 'Kerala Herbal Care',
        sellerId: 'demo-seller-010',
        availability: 'in-stock',
        image: 'https://images.unsplash.com/photo-1626006864202-946131e379dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBoYWlyJTIwb2lsfGVufDF8fHx8MTc2MzE0MTUxMnww&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Herbal hair oil with natural ingredients for healthy hair.',
      },
    ];

    console.log('Seeding products directly to database...');
    
    let successCount = 0;
    let failCount = 0;
    
    // Seed products using a special seed endpoint that doesn't require auth
    for (const product of products) {
      try {
        const response = await fetch(`${BASE_URL}/seed-product`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        console.log(`✓ Created: ${product.name}`);
        successCount++;
      } catch (error: any) {
        console.log(`✗ Failed to create ${product.name}:`, error.message);
        failCount++;
      }
    }

    console.log(`Product seeding complete! Success: ${successCount}, Failed: ${failCount}`);
    
    return { 
      success: true, 
      message: `Products seeded successfully! Created ${successCount} products.`,
      successCount,
      failCount
    };
  } catch (error: any) {
    console.error('Error seeding products:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};