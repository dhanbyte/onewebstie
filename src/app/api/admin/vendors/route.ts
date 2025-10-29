import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export async function GET() {
  try {
    await dbConnect()
    
    const vendors = await Vendor.find({}).sort({ createdAt: -1 })
    
    return NextResponse.json({ 
      success: true, 
      vendors 
    })

  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch vendors' 
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId, status } = await request.json()

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { 
        status,
        ...(status === 'approved' && { approvedAt: new Date() })
      },
      { new: true }
    )

    if (!vendor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor not found' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      vendor 
    })

  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update vendor' 
    })
  }
}