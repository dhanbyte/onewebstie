import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email } = await request.json()

    const vendor = await Vendor.findOne({ email })
    
    if (!vendor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor not found. Please register first.' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      vendor: {
        _id: vendor._id,
        vendorId: vendor.vendorId,
        email: vendor.email,
        name: vendor.name,
        businessName: vendor.businessName,
        status: vendor.status
      }
    })

  } catch (error) {
    console.error('Vendor login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed' 
    })
  }
}