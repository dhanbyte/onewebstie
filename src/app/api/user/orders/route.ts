import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import AdminOrder from '@/models/AdminOrder'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID required' 
      })
    }

    // Find orders for this user
    const orders = await AdminOrder.find({ userId }).sort({ createdAt: -1 })

    // Transform orders to match frontend format
    const transformedOrders = orders.map(order => ({
      id: order.orderId,
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.quantity,
        image: item.image,
        customName: item.customName || null
      })),
      total: order.total,
      status: order.status,
      payment: order.paymentMethod || 'COD',
      address: {
        fullName: order.shippingAddress?.name || 'N/A',
        line1: order.shippingAddress?.address || 'N/A',
        city: order.shippingAddress?.city || 'N/A',
        pincode: order.shippingAddress?.pincode || 'N/A'
      },
      createdAt: order.createdAt
    }))

    return NextResponse.json({ 
      success: true, 
      orders: transformedOrders 
    })

  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch orders',
      orders: []
    })
  }
}