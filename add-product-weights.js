const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

// Weight estimation function (same as in shipping.ts)
const DEFAULT_WEIGHTS = {
  // Electronics
  'mobile': 200,
  'phone': 200,
  'earphone': 50,
  'headphone': 300,
  'speaker': 500,
  'charger': 100,
  'cable': 50,
  'powerbank': 400,
  'watch': 100,
  'smartwatch': 150,
  
  // Fashion
  'tshirt': 200,
  'shirt': 250,
  'jeans': 600,
  'dress': 300,
  'shoes': 800,
  'sandal': 400,
  'bag': 300,
  'wallet': 150,
  'belt': 200,
  'cap': 100,
  
  // Home & Kitchen
  'bottle': 300,
  'mug': 400,
  'plate': 500,
  'bowl': 300,
  'spoon': 50,
  'knife': 100,
  'pan': 1000,
  'pot': 1500,
  
  // Beauty & Personal Care
  'cream': 100,
  'lotion': 150,
  'shampoo': 300,
  'soap': 100,
  'perfume': 200,
  
  // Books & Stationery
  'book': 300,
  'notebook': 200,
  'pen': 20,
  'pencil': 10,
  
  // Sports & Fitness
  'ball': 400,
  'bat': 800,
  'racket': 300,
  
  // Toys & Games
  'toy': 200,
  'game': 500,
  
  // Default fallback
  'default': 250
};

function estimateProductWeight(productName, category) {
  const name = productName.toLowerCase();
  
  // Check for specific keywords in product name
  for (const [keyword, weight] of Object.entries(DEFAULT_WEIGHTS)) {
    if (name.includes(keyword)) {
      return weight;
    }
  }
  
  // Check category-based weights
  if (category) {
    const cat = category.toLowerCase();
    if (cat.includes('electronic') || cat.includes('mobile') || cat.includes('tech')) {
      return 300;
    }
    if (cat.includes('fashion') || cat.includes('clothing') || cat.includes('apparel')) {
      return 250;
    }
    if (cat.includes('home') || cat.includes('kitchen')) {
      return 400;
    }
    if (cat.includes('beauty') || cat.includes('personal')) {
      return 150;
    }
    if (cat.includes('book') || cat.includes('stationery')) {
      return 200;
    }
    if (cat.includes('sports') || cat.includes('fitness')) {
      return 500;
    }
    if (cat.includes('toy') || cat.includes('game')) {
      return 300;
    }
  }
  
  return DEFAULT_WEIGHTS.default;
}

async function addWeightsToProducts() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection('products');
    
    // Get all products without weight
    const products = await collection.find({ weight: { $exists: false } }).toArray();
    console.log(`Found ${products.length} products without weight`);
    
    let updated = 0;
    
    for (const product of products) {
      const estimatedWeight = estimateProductWeight(product.name, product.category);
      
      await collection.updateOne(
        { _id: product._id },
        { $set: { weight: estimatedWeight } }
      );
      
      console.log(`Updated ${product.name}: ${estimatedWeight}g`);
      updated++;
    }
    
    console.log(`Successfully updated ${updated} products with estimated weights`);
    
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await client.close();
  }
}

addWeightsToProducts();