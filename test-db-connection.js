const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://dhananjaywin15112004:ec2cY3Gk2HxizdS2@cluster.4jkps.mongodb.net/photos-test?retryWrites=true&w=majority&appName=photos-test';

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
        
        // Test creating a simple document
        const testSchema = new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', testSchema);
        
        const testDoc = new TestModel({ name: 'Connection Test' });
        await testDoc.save();
        console.log('✅ Test document created successfully');
        
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('✅ Test document deleted successfully');
        
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected successfully');
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();