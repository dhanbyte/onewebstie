import { NextResponse } from 'next/server';

// Available categories and subcategories based on existing products
const CATEGORIES = {
  "Tech": [
    "Accessories",
    "Audio", 
    "Computer Accessories",
    "Decor & Lighting",
    "Outdoor Lighting"
  ],
  "Home": [
    "Puja-Essentials",
    "Bathroom-Accessories", 
    "Kitchenware",
    "Household-Appliances",
    "Food Storage",
    "Drinkware",
    "Storage & Organization",
    "Kitchen Tools",
    "Baking Tools"
  ],
  "New Arrivals": [
    "Best Selling",
    "Outdoor Lighting"
  ],
  "Hair": [
    "Accessories"
  ]
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      categories: CATEGORIES
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories',
      categories: CATEGORIES
    });
  }
}