import mongoose from 'mongoose'

const VendorOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  vendorId: { type: String, required: true },
  customerId: { type: String, required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  vendorTotal: { type: Number, required: true },
  commission: { type: Number, required: true },
  netAmount: { type: Number, required: true }, // vendorTotal - commission
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  shippingAddress: Object,
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.VendorOrder || mongoose.model('VendorOrder', VendorOrderSchema)