import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorOrder from '@/models/VendorOrder'
import { MongoClient } from 'mongodb'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const limit = searchParams.get('limit')

    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor ID required' 
      })
    }

    // Get orders for this vendor only
    let query = VendorOrder.find({ vendorId }).sort({ createdAt: -1 })
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const orders = await query

    // Connect to MongoDB to get customer details
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    const db = client.db(process.env.MONGODB_DB_NAME)
    
    // Fetch customer details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        let customerDetails = null
        
        if (order.customerId) {
          // Try to find customer in users collection
          customerDetails = await db.collection('users').findOne(
            { email: order.customerId },
            { projection: { name: 1, email: 1, phone: 1 } }
          )
        }
        
        // Calculate order totals if missing
        const orderObj = order.toObject()
        const products = orderObj.products || []
        const calculatedSubtotal = products.reduce((sum, product) => {
          return sum + (product.price * product.quantity)
        }, 0)
        
        return {
          ...orderObj,
          customerDetails: customerDetails || {
            name: order.customerName || 'Unknown Customer',
            email: order.customerId || 'N/A',
            phone: order.customerPhone || 'N/A'
          },
          shippingAddress: order.shippingAddress || {
            street: 'Address not provided',
            city: 'N/A',
            state: 'N/A',
            pincode: 'N/A'
          },
          subtotal: orderObj.subtotal || calculatedSubtotal,
          shipping: orderObj.shipping || 0,
          tax: orderObj.tax || 0,
          total: orderObj.total || calculatedSubtotal
        }
      })
    )
    
    await client.close()

    return NextResponse.json({ 
      success: true, 
      orders: ordersWithDetails 
    })

  } catch (error) {
    console.error('Error fetching vendor orders:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch orders',
      orders: []
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { orderId, status } = await request.json()

    // Update order status
    const order = await VendorOrder.findByIdAndUpdate(
      orderId,
      { 
        status, 
        updatedAt: new Date(),
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() }),
        ...(status === 'cancelled' && { cancelledAt: new Date() })
      },
      { new: true }
    )

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order ${status} successfully`,
      order 
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update order' 
    })
  }
}