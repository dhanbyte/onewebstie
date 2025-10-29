const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meradukan';

async function createSampleOrders() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    const ordersCollection = db.collection('adminorders');
    
    const sampleOrders = [
      {
        orderId: 'ORD001',
        userId: 'john@example.com',
        items: [
          {
            productId: 'prod1',
            name: 'iPhone 15',
            price: 79999,
            quantity: 1,
            image: '/images/placeholder.jpg'
          },
          {
            productId: 'prod2',
            name: 'AirPods Pro',
            price: 24999,
            quantity: 1,
            image: '/images/placeholder.jpg'
          }
        ],
        total: 104998,
        status: 'pending',
        paymentMethod: 'razorpay',
        paymentId: 'pay_123456789',
        shippingAddress: {
          name: 'John Doe',
          phone: '+91 9876543210',
          address: '123 Main Street, Sector 15',
          city: 'Gurgaon',
          state: 'Haryana',
          pincode: '122001'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        orderId: 'ORD002',
        userId: 'jane@example.com',
        items: [
          {
            productId: 'prod3',
            name: 'Samsung Galaxy S24',
            price: 69999,
            quantity: 1,
            image: '/images/placeholder.jpg'
          }
        ],
        total: 69999,
        status: 'shipped',
        paymentMethod: 'razorpay',
        paymentId: 'pay_987654321',
        shippingAddress: {
          name: 'Jane Smith',
          phone: '+91 8765432109',
          address: '456 Park Avenue, Block A',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-16')
      },
      {
        orderId: 'ORD003',
        userId: 'bob@example.com',
        items: [
          {
            productId: 'prod4',
            name: 'MacBook Air M2',
            price: 99999,
            quantity: 1,
            image: '/images/placeholder.jpg'
          },
          {
            productId: 'prod5',
            name: 'Magic Mouse',
            price: 7999,
            quantity: 1,
            image: '/images/placeholder.jpg'
          }
        ],
        total: 107998,
        status: 'delivered',
        paymentMethod: 'razorpay',
        paymentId: 'pay_456789123',
        shippingAddress: {
          name: 'Bob Johnson',
          phone: '+91 7654321098',
          address: '789 Tech Park, Phase 2',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001'
        },
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-18')
      }
    ];
    
    // Clear existing orders
    await ordersCollection.deleteMany({});
    
    // Insert sample orders
    const result = await ordersCollection.insertMany(sampleOrders);
    console.log(`✅ Created ${result.insertedCount} sample orders`);
    
    // Verify insertion
    const count = await ordersCollection.countDocuments();
    console.log(`📊 Total orders in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
  } finally {
    await client.close();
  }
}

createSampleOrders();