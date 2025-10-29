import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { 
      email, name, businessName, phone, businessType, gstNumber, panNumber, aadharNumber,
      address, bankDetails, profilePhoto, brandName 
    } = await request.json()

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email })
    if (existingVendor) {
      let errorMessage = 'Email already registered'
      let suggestion = ''

      switch (existingVendor.status) {
        case 'pending':
          errorMessage = 'An account with this email is already registered and pending approval'
          suggestion = 'Please wait for admin approval or contact support if you need assistance.'
          break
        case 'approved':
          errorMessage = 'An account with this email is already active'
          suggestion = 'Please login to your existing account.'
          break
        case 'rejected':
          errorMessage = 'An account with this email was previously rejected'
          suggestion = 'Please contact support for assistance or use a different email.'
          break
        case 'suspended':
          errorMessage = 'An account with this email has been suspended'
          suggestion = 'Please contact support for assistance.'
          break
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        suggestion: suggestion,
        status: existingVendor.status
      })
    }

    // Generate default password
    const defaultPassword = 'vendor123'
    
    // Create new vendor
    const vendor = new Vendor({
      email,
      password: defaultPassword,
      name,
      businessName,
      brandName,
      phone,
      businessType,
      gstNumber,
      panNumber,
      aadharNumber,
      profilePhoto,
      address,
      bankDetails,
      status: 'pending',
      commission: 15,
      totalEarnings: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalOrders: 0,
      rating: 0,
      reviewCount: 0
    })

    // Save vendor (this will trigger the pre-save hook to generate vendorId)
    await vendor.save()
    console.log('Vendor created with ID:', vendor._id, 'vendorId:', vendor.vendorId)

    return NextResponse.json({ 
      success: true, 
      message: 'Vendor registration submitted successfully' 
    })

  } catch (error) {
    console.error('Vendor registration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Registration failed' 
    })
  }
}