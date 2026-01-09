import { projectId, publicAnonKey } from './utils/supabase/info';

// Demo accounts configuration
const DEMO_ACCOUNTS = [
  {
    email: 'buyer@demo.com',
    password: 'demo123',
    name: 'Demo Buyer',
    role: 'Regular buyer account for testing purchases'
  },
  {
    email: 'seller@demo.com',
    password: 'demo123',
    name: 'Demo Seller',
    role: 'Seller account for testing product management'
  },
  {
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'Demo Admin',
    role: 'Admin account for testing all features'
  }
];

async function seedDemoUsers() {
  console.log('🌱 Starting demo user seeding...\n');
  
  const results = [];
  
  for (const account of DEMO_ACCOUNTS) {
    try {
      console.log(`Creating account: ${account.email}...`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-93d78077/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: account.email,
            password: account.password,
            name: account.name
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Successfully created: ${account.email}`);
        results.push({
          success: true,
          ...account
        });
      } else if (data.error && data.error.includes('already registered')) {
        console.log(`ℹ️  Account already exists: ${account.email}`);
        results.push({
          success: true,
          alreadyExists: true,
          ...account
        });
      } else {
        console.log(`❌ Failed to create ${account.email}: ${data.error}`);
        results.push({
          success: false,
          error: data.error,
          ...account
        });
      }
    } catch (error: any) {
      console.log(`❌ Error creating ${account.email}: ${error.message}`);
      results.push({
        success: false,
        error: error.message,
        ...account
      });
    }
    
    console.log(''); // Empty line for readability
  }

  // Print summary
  console.log('\n📊 DEMO ACCOUNTS SUMMARY');
  console.log('=' .repeat(50));
  console.log('\n✨ Available Demo Accounts:\n');
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`${index + 1}. ${result.role}`);
      console.log(`   Email: ${result.email}`);
      console.log(`   Password: ${result.password}`);
      console.log(`   Name: ${result.name}`);
      console.log('');
    }
  });

  console.log('=' .repeat(50));
  console.log('\n💡 TIP: Use these accounts to test:');
  console.log('   • buyer@demo.com - Browse products, add to cart, checkout');
  console.log('   • seller@demo.com - Create and manage products in seller dashboard');
  console.log('   • admin@demo.com - Full access to all features\n');
  
  return results;
}

// Run the seeding
seedDemoUsers().catch(console.error);
