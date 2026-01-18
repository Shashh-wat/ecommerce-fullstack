import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-93d78077`;

export async function seedDemoAccounts() {
  console.log('🌱 Starting demo account seeding...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  try {
    // Use the regular signup endpoint to create demo accounts
    const demoAccounts = [
      { 
        email: 'buyer@demo.com', 
        password: 'demo123', 
        name: 'Demo Buyer',
      },
      { 
        email: 'seller@demo.com', 
        password: 'demo123', 
        name: 'Demo Seller',
      },
      { 
        email: 'admin@demo.com', 
        password: 'demo123', 
        name: 'Demo Admin',
      },
    ];

    const results = [];

    for (const account of demoAccounts) {
      try {
        console.log(`\n👤 Creating account: ${account.email}`);
        
        const response = await fetch(`${BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(account),
        });

        console.log(`   Response status: ${response.status} ${response.statusText}`);
        
        const result = await response.json();
        console.log(`   Response data:`, result);

        if (response.ok) {
          console.log(`   ✅ Demo account ${account.email} created successfully`);
          results.push({ email: account.email, status: 'created' });
        } else if (result.error?.toLowerCase().includes('already') || 
                   result.error?.toLowerCase().includes('exists') ||
                   result.error?.toLowerCase().includes('duplicate')) {
          console.log(`   ℹ️ Demo account ${account.email} already exists`);
          results.push({ email: account.email, status: 'already_exists' });
        } else {
          console.log(`   ❌ Failed to create demo account ${account.email}: ${result.error}`);
          results.push({ email: account.email, status: 'error', error: result.error });
        }
      } catch (error: any) {
        console.log(`   ❌ Error creating demo account ${account.email}: ${error.message}`);
        results.push({ email: account.email, status: 'error', error: error.message });
      }
    }

    console.log('\n📊 Demo accounts seeding completed:', results);
    
    // Consider it successful if at least one account was created or already exists
    const hasSuccess = results.some(r => r.status === 'created' || r.status === 'already_exists');
    
    console.log(`\n${hasSuccess ? '✅' : '❌'} Seeding result: ${hasSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    return hasSuccess;
  } catch (error) {
    console.error('💥 Error seeding demo accounts:', error);
    return false;
  }
}