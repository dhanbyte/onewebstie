// Use built-in fetch for Node.js 18+
if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
}

const testProduct = {
    name: "Test Product from Script",
    category: "Electronics", 
    price: 999,
    description: "This is a test product created from script",
    image: "https://via.placeholder.com/300",
    stock: 10
};

async function testAddProduct() {
    try {
        console.log('Testing add product API...');
        console.log('Product data:', testProduct);
        
        const response = await fetch('http://localhost:3000/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testProduct),
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);

        if (response.ok && result.success) {
            console.log('✅ Product added successfully!');
        } else {
            console.log('❌ Failed to add product:', result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAddProduct();