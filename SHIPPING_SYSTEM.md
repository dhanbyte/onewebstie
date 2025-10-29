# Weight-Based Shipping System

## Overview
This system implements dynamic shipping charges based on product weight with COD support.

## Shipping Rates
- 0 to 0.5kg – ₹49
- 0.5kg to 1kg – ₹69
- 1 to 2kg – ₹89
- 2 to 3kg – ₹109
- 3 to 4kg – ₹129
- 4 to 5kg – ₹149
- 5 to 10kg – ₹199
- Above 10kg – ₹299

## COD Charges
- Additional ₹30 charge for Cash on Delivery orders

## Features

### 1. Weight Estimation
- Products without specified weight get auto-estimated based on:
  - Product name keywords
  - Category classification
  - Default fallback weights

### 2. Packaging Weight
- Automatic 50g packaging weight added to all orders

### 3. Smart Weight Detection
Default weights by product type:
- Electronics: 200-500g
- Fashion: 100-600g
- Home & Kitchen: 300-1500g
- Beauty: 100-300g
- Books: 200-300g
- Sports: 300-800g

### 4. Admin Features
- Weight field in product form
- Auto-estimation if weight not specified
- Shipping cost preview

### 5. Customer Features
- Weight-based shipping calculation
- Shipping details breakdown
- COD option with additional charges
- Real-time shipping cost updates

## Implementation Files

### Core Files
- `src/lib/utils/shipping.ts` - Main shipping logic
- `src/lib/types.ts` - Type definitions
- `src/models/Product.ts` - Database schema

### Components
- `src/components/ShippingDetails.tsx` - Shipping breakdown display
- `src/components/ProductForm.tsx` - Admin product form with weight
- `src/app/checkout/page.tsx` - Checkout with COD support

### Scripts
- `add-product-weights.js` - Add weights to existing products

## Usage

### Adding Weight to Products
```javascript
// In admin panel
weight: 250 // grams

// Auto-estimation if not specified
// Based on product name and category
```

### Checkout Process
1. Cart calculates total weight
2. Shipping cost determined by weight brackets
3. COD option adds ₹30 charge
4. Final total includes shipping + COD (if selected)

### Running Weight Migration
```bash
node add-product-weights.js
```

## Database Changes
- Added `weight` field to Product model (optional)
- Existing products get estimated weights via migration script

## API Integration
- Cart store automatically calculates shipping
- Checkout supports both online payment and COD
- Order placement includes shipping details

## Benefits
1. **Accurate Shipping**: Weight-based calculation
2. **Flexible Pricing**: Different rates for different weights
3. **COD Support**: Cash on delivery option
4. **Auto-Estimation**: Smart weight detection
5. **Transparency**: Detailed shipping breakdown
6. **Admin Control**: Manual weight override capability