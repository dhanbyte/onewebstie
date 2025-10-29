import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const email = searchParams.get('email')

    if (!vendorId && !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor ID or email required' 
      })
    }

    const vendor = vendorId ? 
      await Vendor.findById(vendorId) : 
      await Vendor.findOne({ email })
    
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
    console.error('Error fetching vendor profile:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId, ...updateData } = await request.json()

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { 
        ...updateData,
        updatedAt: new Date()
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
    console.error('Error updating vendor profile:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update profile' 
    })
  }
}