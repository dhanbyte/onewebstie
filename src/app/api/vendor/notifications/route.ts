import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorNotification from '@/models/VendorNotification'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor ID required' 
      })
    }

    // Get notifications for this vendor only
    const notifications = await VendorNotification.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(10)

    return NextResponse.json({ 
      success: true, 
      notifications 
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch notifications',
      notifications: []
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { notificationId, read } = await request.json()

    await VendorNotification.findByIdAndUpdate(notificationId, { read })

    return NextResponse.json({ 
      success: true 
    })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update notification' 
    })
  }
}