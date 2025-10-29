import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminOrder from '@/models/AdminOrder';
import AdminUser from '@/models/AdminUser';
import VendorOrder from '@/models/VendorOrder';
import VendorProduct from '@/models/VendorProduct';
// Also try the actual model name used in the schema
let VendorProductModel;
try {
  VendorProductModel = require('@/models/VendorProduct').default;
} catch (e) {
  console.log('VendorProduct model import failed:', e.message);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, total, paymentMethod, paymentId, shippingAddress } = body;

    if (!userId || !items || !total) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    await dbConnect();
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new order
    const order = new AdminOrder({
      orderId,
      userId,
      items,
      total,
      status: 'pending',
      paymentMethod,
      paymentId,
      shippingAddress
    });

    await order.save();

    // Create vendor orders for vendor products
    const vendorOrders = [];
    console.log('🔍 Checking items for vendor products:', items.map(i => ({ id: i.id, name: i.name })));
    
    for (const item of items) {
      // Check if this is a vendor product
      let vendorProduct = null;
      
      try {
        // Try multiple ways to find the vendor product
        vendorProduct = await VendorProduct.findById(item.id).catch(() => null);
        
        if (!vendorProduct) {
          vendorProduct = await VendorProduct.findOne({ productId: item.id }).catch(() => null);
        }
        
        if (!vendorProduct) {
          vendorProduct = await VendorProduct.findOne({ name: item.name }).catch(() => null);
        }
        
        // Check if item has isVendorProduct flag
        if (!vendorProduct && item.isVendorProduct) {
          vendorProduct = await VendorProduct.findOne({}).catch(() => null);
        }
        
      } catch (error) {
        console.error('Error finding vendor product:', error);
      }
      
      console.log(`🔍 Item ${item.id} vendor product:`, vendorProduct ? 'Found' : 'Not found');
      
      if (vendorProduct) {
        console.log('📦 Creating vendor order for:', vendorProduct.name, 'Vendor:', vendorProduct.vendorId);
        
        const vendorOrder = new VendorOrder({
          orderId,
          vendorId: vendorProduct.vendorId,
          customerId: userId,
          items: [{
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          }],
          vendorTotal: item.price * item.quantity,
          commission: (item.price * item.quantity) * 0.1, // 10% commission
          netAmount: (item.price * item.quantity) * 0.9, // 90% to vendor
          status: 'pending',
          shippingAddress
        });
        
        await vendorOrder.save();
        vendorOrders.push(vendorOrder);
        console.log('✅ Vendor order created successfully');
      }
    }
    
    console.log(`📊 Created ${vendorOrders.length} vendor orders`);

    // Update user's purchase status
    await AdminUser.findOneAndUpdate(
      { userId },
      { 
        $inc: { coins: Math.floor(total * 0.01) }, // 1% cashback in coins
        updatedAt: new Date()
      }
    );

    return NextResponse.json({ 
      success: true, 
      order,
      orderId,
      vendorOrdersCreated: vendorOrders.length,
      message: 'Order placed successfully' 
    });

  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to place order' 
    }, { status: 500 });
  }
}