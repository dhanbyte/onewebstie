import mongoose from 'mongoose'

const VendorNotificationSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['order', 'payment', 'product', 'system', 'warning'], 
    default: 'system' 
  },
  read: { type: Boolean, default: false },
  data: mongoose.Schema.Types.Mixed, // Additional data like orderId, productId etc
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.VendorNotification || mongoose.model('VendorNotification', VendorNotificationSchema)