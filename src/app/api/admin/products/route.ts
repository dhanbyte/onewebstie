import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()
    
    const products = await Product.find({}).sort({ createdAt: -1 })
    
    return NextResponse.json({ 
      success: true, 
      products 
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch products',
      products: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const data = await request.json()
    console.log('Received product data:', data)
    
    // Generate unique slug
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const slug = `${baseSlug}-${Date.now()}`
    
    // Create product data without any vendor references
    const productData = {
      name: data.name,
      category: data.category,
      price: {
        original: Number(data.price),
        currency: '₹'
      },
      image: data.image || '/images/placeholder.jpg',
      description: data.description || '',
      quantity: Number(data.stock) || 0,
      slug: slug,
      inventory: {
        inStock: (Number(data.stock) || 0) > 0,
        lowStockThreshold: 5
      },
      status: 'active',
      shippingCost: 0,
      taxPercent: 18,
      ratings: {
        average: 4.2,
        count: Math.floor(Math.random() * 50) + 10
      },
      returnPolicy: {
        eligible: true,
        duration: 7
      },
      warranty: '1 Year Warranty'
    }
    
    console.log('Creating product with data:', productData)
    
    const product = new Product(productData)
    const savedProduct = await product.save()
    
    console.log('Product saved successfully:', savedProduct._id)

    return NextResponse.json({ 
      success: true, 
      product: savedProduct 
    })

  } catch (error) {
    console.error('Error creating product:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create product' 
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    await Product.findOneAndDelete({ id })

    return NextResponse.json({ 
      success: true 
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete product' 
    })
  }
}