import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorProduct from '@/models/VendorProduct'
import VendorOrder from '@/models/VendorOrder'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Vendor stats API called')
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor ID required' 
      }, { status: 400 })
    }

    console.log('📊 Fetching stats for vendor:', vendorId)
    
    // Connect to database
    await dbConnect()
    console.log('✅ Database connected')

    // Fetch real data from database with timeout protection
    const [totalProducts, orders] = await Promise.all([
      VendorProduct.countDocuments({ vendorId }).maxTimeMS(5000),
      VendorOrder.find({ vendorId }).maxTimeMS(5000)
    ])

    const totalOrders = orders.length
    const pendingOrders = orders.filter(order => order.status === 'pending').length
    const totalEarnings = orders.reduce((sum, order) => sum + (order.netAmount || 0), 0)

    const stats = {
      totalProducts,
      totalOrders,
      totalEarnings,
      pendingOrders
    }
    
    console.log('📈 Stats calculated:', stats)

    return NextResponse.json({ 
      success: true, 
      stats
    })
  } catch (error) {
    console.error('❌ Error fetching vendor stats:', error)
    
    // Return default stats on error
    const defaultStats = {
      totalProducts: 0,
      totalOrders: 0,
      totalEarnings: 0,
      pendingOrders: 0
    }
    
    return NextResponse.json({ 
      success: true, // Still return success with default values
      message: 'Using default stats due to connection issue',
      stats: defaultStats
    })
  }
}