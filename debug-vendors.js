import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()

    // Find all vendors without vendorId or with null vendorId
    const vendorsWithoutId = await Vendor.find({
      $or: [
        { vendorId: { $exists: false } },
        { vendorId: null },
        { vendorId: '' }
      ]
    })

    console.log(`Found ${vendorsWithoutId.length} vendors without vendorId`)

    // Generate vendorIds for vendors that don't have them
    for (const vendor of vendorsWithoutId) {
      vendor.vendorId = 'VND' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
      await vendor.save()
      console.log(`Generated vendorId ${vendor.vendorId} for vendor ${vendor.email}`)
    }

    // Find all vendors to verify
    const allVendors = await Vendor.find({}, 'email vendorId status brandName').sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: `Fixed ${vendorsWithoutId.length} vendors without vendorId`,
      totalVendors: allVendors.length,
      vendorsWithoutId: vendorsWithoutId.length,
      recentVendors: allVendors.slice(0, 5)
    })

  } catch (error) {
    console.error('Error in debug script:', error)
    res.status(500).json({
      success: false,
      message: 'Debug script failed',
      error: error.message
    })
  }
}
