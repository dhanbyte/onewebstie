'use client'
import { useState, useEffect } from 'react'
import { 
  CheckCircle, XCircle, Clock, Users, Eye, Edit, Bell,
  Building, Phone, Mail, MapPin, CreditCard, FileText,
  Package, TrendingUp, DollarSign, Calendar, Copy,
  Star, AlertTriangle, Settings, Search, Plus, EyeOff
} from 'lucide-react'

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [vendorProducts, setVendorProducts] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [newPhoto, setNewPhoto] = useState(null)

  useEffect(() => {
    fetchVendors()
  }, [])

  useEffect(() => {
    if (selectedVendor) {
      fetchVendorProducts(selectedVendor._id)
    }
  }, [selectedVendor])

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/admin/vendors')
      const data = await response.json()
      
      if (data.success) {
        setVendors(data.vendors)
      } else {
        setVendors([])
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  const updateVendorStatus = async (id, status) => {
    try {
      const response = await fetch('/api/admin/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: id, status })
      })
      
      if (response.ok) {
        alert(`Vendor ${status} successfully`)
        fetchVendors()
        if (selectedVendor && selectedVendor._id === id) {
          setSelectedVendor({...selectedVendor, status})
        }
      }
    } catch (error) {
      alert('Failed to update vendor status')
    }
  }

  const updateCommissionRate = async (id, rate) => {
    try {
      const response = await fetch('/api/admin/vendors/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: id, commission: rate })
      })
      
      if (response.ok) {
        alert('Commission rate updated')
        fetchVendors()
      }
    } catch (error) {
      alert('Failed to update commission')
    }
  }

  const copyVendorInfo = (vendor) => {
    const info = `
Vendor ID: ${vendor.vendorId || 'Not Generated'}
Business Name: ${vendor.businessName}
Owner: ${vendor.name}
Email: ${vendor.email}
Password: ${vendor.password || 'Not Set'}
Phone: ${vendor.phone}
Address: ${vendor.address?.street}, ${vendor.address?.city}, ${vendor.address?.state} - ${vendor.address?.pincode}
Status: ${vendor.status}
Commission: ${vendor.commission || 15}%
Applied: ${new Date(vendor.createdAt).toLocaleDateString()}
    `.trim()
    
    navigator.clipboard.writeText(info)
    alert('Vendor info with credentials copied to clipboard')
  }

  const sendNotification = async (vendorId, title = null, message = null) => {
    const notificationTitle = title || prompt('Enter notification title:')
    const notificationMessage = message || prompt('Enter notification message:')
    
    if (!notificationTitle || !notificationMessage) return
    
    try {
      const response = await fetch('/api/admin/vendor-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'system'
        })
      })
      
      if (response.ok) {
        alert('Notification sent successfully!')
      } else {
        alert('Failed to send notification')
      }
    } catch (error) {
      alert('Error sending notification')
    }
  }

  const resetPassword = async (vendorId) => {
    const newPassword = prompt('Enter new password for vendor (min 6 characters):')
    
    if (!newPassword) return
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }
    
    try {
      const response = await fetch('/api/admin/vendors/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          newPassword
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Password changed successfully!\nNew Password: ${newPassword}`)
        fetchVendors()
        if (selectedVendor && selectedVendor._id === vendorId) {
          setSelectedVendor({...selectedVendor, password: newPassword})
        }
      } else {
        alert(data.message || 'Failed to change password')
      }
    } catch (error) {
      alert('Error changing password')
    }
  }

  const openEditModal = (vendor) => {
    setEditFormData({
      name: vendor.name,
      businessName: vendor.businessName,
      phone: vendor.phone,
      businessType: vendor.businessType || 'Individual',
      gstNumber: vendor.gstNumber || '',
      panNumber: vendor.panNumber || '',
      aadharNumber: vendor.aadharNumber || '',
      street: vendor.address?.street || '',
      city: vendor.address?.city || '',
      state: vendor.address?.state || '',
      pincode: vendor.address?.pincode || '',
      bankName: vendor.bankDetails?.bankName || '',
      accountNumber: vendor.bankDetails?.accountNumber || '',
      ifscCode: vendor.bankDetails?.ifscCode || '',
      accountHolder: vendor.bankDetails?.accountHolder || ''
    })
    setShowEditModal(true)
  }

  const saveVendorProfile = async () => {
    try {
      let photoUrl = selectedVendor.profilePhoto
      
      if (newPhoto) {
        const formData = new FormData()
        formData.append('file', newPhoto)
        formData.append('fileName', `vendor-${selectedVendor._id}-${Date.now()}`)
        formData.append('folder', '/vendor-profiles')
        
        const uploadResponse = await fetch('/api/imagekit/upload', {
          method: 'POST',
          body: formData
        })
        
        const uploadData = await uploadResponse.json()
        if (uploadData.success) {
          photoUrl = uploadData.url
        }
      }

      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: selectedVendor._id,
          ...editFormData,
          profilePhoto: photoUrl,
          address: {
            street: editFormData.street,
            city: editFormData.city,
            state: editFormData.state,
            pincode: editFormData.pincode
          },
          bankDetails: {
            bankName: editFormData.bankName,
            accountNumber: editFormData.accountNumber,
            ifscCode: editFormData.ifscCode,
            accountHolder: editFormData.accountHolder
          }
        })
      })

      if (response.ok) {
        alert('Profile updated successfully!')
        setShowEditModal(false)
        setNewPhoto(null)
        fetchVendors()
        if (selectedVendor) {
          const updatedVendor = {...selectedVendor, ...editFormData, profilePhoto: photoUrl}
          setSelectedVendor(updatedVendor)
        }
      }
    } catch (error) {
      alert('Failed to update profile')
    }
  }

  const fetchVendorProducts = async (vendorId) => {
    try {
      const response = await fetch(`/api/admin/vendor-products?vendorId=${vendorId}`)
      const data = await response.json()
      if (data.success) {
        setVendorProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching vendor products:', error)
    }
  }

  const updateProductStatus = async (productId, status) => {
    try {
      const response = await fetch('/api/admin/vendor-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status })
      })
      
      if (response.ok) {
        alert(`Product ${status} successfully`)
        fetchVendorProducts(selectedVendor._id)
      }
    } catch (error) {
      alert('Failed to update product status')
    }
  }

  const deleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch('/api/admin/vendor-products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })
        
        if (response.ok) {
          alert('Product deleted successfully')
          fetchVendorProducts(selectedVendor._id)
        }
      } catch (error) {
        alert('Failed to delete product')
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredVendors = vendors.filter(vendor =>
    vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedVendor) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedVendor(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Vendors
          </button>
          <h1 className="text-3xl font-bold">Vendor Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Login Credentials */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Login Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor ID</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={selectedVendor.vendorId || 'Not Generated'} 
                      readOnly 
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedVendor.vendorId || '')
                        alert('Vendor ID copied!')
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50"
                      title="Copy Vendor ID"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={selectedVendor.email} 
                      readOnly 
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedVendor.email)
                        alert('Email copied!')
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50"
                      title="Copy Email"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={selectedVendor.password || 'vendor123'} 
                      readOnly 
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50"
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedVendor.password || 'vendor123')
                        alert('Password copied!')
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50"
                      title="Copy Password"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => resetPassword(selectedVendor._id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                      title="Reset Password"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  {selectedVendor.profilePhoto && (
                    <img 
                      src={selectedVendor.profilePhoto} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedVendor.businessName}</h2>
                    <p className="text-gray-600">Owner: {selectedVendor.name}</p>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mt-2 ${getStatusColor(selectedVendor.status)}`}>
                      {getStatusIcon(selectedVendor.status)}
                      {selectedVendor.status}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyVendorInfo(selectedVendor)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Copy className="h-4 w-4" />
                  Copy Info
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Business Name:</strong> {selectedVendor.businessName}</div>
                    <div><strong>Business Type:</strong> {selectedVendor.businessType || 'Not specified'}</div>
                    <div><strong>GST Number:</strong> {selectedVendor.gstNumber || 'Not provided'}</div>
                    <div><strong>PAN Number:</strong> {selectedVendor.panNumber || 'Not provided'}</div>
                    <div><strong>Aadhar Number:</strong> {selectedVendor.aadharNumber || 'Not provided'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {selectedVendor.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {selectedVendor.phone}
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        {selectedVendor.address?.street}<br/>
                        {selectedVendor.address?.city}, {selectedVendor.address?.state}<br/>
                        Pincode: {selectedVendor.address?.pincode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Bank Name:</strong> {selectedVendor.bankDetails?.bankName || 'Not provided'}</div>
                    <div><strong>Account Number:</strong> {selectedVendor.bankDetails?.accountNumber || 'Not provided'}</div>
                    <div><strong>IFSC Code:</strong> {selectedVendor.bankDetails?.ifscCode || 'Not provided'}</div>
                    <div><strong>Account Holder:</strong> {selectedVendor.bankDetails?.accountHolder || selectedVendor.name}</div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Commission Rate:</strong> 
                      <input 
                        type="number" 
                        value={selectedVendor.commission || 15}
                        onChange={(e) => updateCommissionRate(selectedVendor._id, e.target.value)}
                        className="ml-2 w-16 px-2 py-1 border rounded"
                      />%
                    </div>
                    <div><strong>Total Earnings:</strong> ₹{selectedVendor.totalEarnings?.toLocaleString() || 0}</div>
                    <div><strong>Pending Payments:</strong> ₹{selectedVendor.pendingPayments?.toLocaleString() || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Products</span>
                  </div>
                  <span className="font-medium">{selectedVendor.totalProducts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Orders</span>
                  </div>
                  <span className="font-medium">{selectedVendor.totalOrders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Revenue</span>
                  </div>
                  <span className="font-medium">₹{selectedVendor.totalRevenue?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-medium">{selectedVendor.rating || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                {selectedVendor.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateVendorStatus(selectedVendor._id, 'approved')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Vendor
                    </button>
                    <button
                      onClick={() => updateVendorStatus(selectedVendor._id, 'rejected')}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Vendor
                    </button>
                  </>
                )}
                
                {selectedVendor.status === 'approved' && (
                  <>
                    <button
                      onClick={() => updateVendorStatus(selectedVendor._id, 'suspended')}
                      className="w-full border border-orange-500 text-orange-500 px-4 py-2 rounded hover:bg-orange-50 flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Suspend Vendor
                    </button>
                    <button
                      onClick={() => openEditModal(selectedVendor)}
                      className="w-full border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50 flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => sendNotification(selectedVendor._id)}
                      className="w-full border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-50 flex items-center justify-center gap-2"
                    >
                      <Bell className="h-4 w-4" />
                      Send Notice
                    </button>
                  </>
                )}
                
                {selectedVendor.status === 'suspended' && (
                  <>
                    <button
                      onClick={() => updateVendorStatus(selectedVendor._id, 'approved')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Activate Vendor
                    </button>
                    <button
                      onClick={() => sendNotification(selectedVendor._id)}
                      className="w-full border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-50 flex items-center justify-center gap-2"
                    >
                      <Bell className="h-4 w-4" />
                      Send Notice
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Applied: {new Date(selectedVendor.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedVendor.approvedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Approved: {new Date(selectedVendor.approvedAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Last Updated: {new Date(selectedVendor.updatedAt || selectedVendor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Vendor Products */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Vendor Products ({vendorProducts.length})
                </h3>
                <button
                  onClick={() => fetchVendorProducts(selectedVendor._id)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Refresh
                </button>
              </div>
              
              {vendorProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products found</p>
              ) : (
                <div className="space-y-3">
                  {vendorProducts.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">₹{product.price}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'blocked' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="flex gap-1 ml-4">
                          {product.status === 'active' ? (
                            <button
                              onClick={() => updateProductStatus(product._id, 'blocked')}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={() => updateProductStatus(product._id, 'active')}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Active
                            </button>
                          )}
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              const message = prompt('Enter notice for this product:')
                              if (message) {
                                sendNotification(selectedVendor._id, `Product Notice: ${product.name}`, message)
                              }
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Notice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Edit Vendor Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-gray-300 rounded-full overflow-hidden">
                    {newPhoto ? (
                      <img src={URL.createObjectURL(newPhoto)} alt="New" className="w-full h-full object-cover" />
                    ) : selectedVendor.profilePhoto ? (
                      <img src={selectedVendor.profilePhoto} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Photo</div>
                    )}
                  </div>
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewPhoto(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    value={editFormData.businessName || ''}
                    onChange={(e) => setEditFormData({...editFormData, businessName: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Business Type</label>
                  <select
                    value={editFormData.businessType || 'Individual'}
                    onChange={(e) => setEditFormData({...editFormData, businessType: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="LLP">LLP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GST Number</label>
                  <input
                    type="text"
                    value={editFormData.gstNumber || ''}
                    onChange={(e) => setEditFormData({...editFormData, gstNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={editFormData.panNumber || ''}
                    onChange={(e) => setEditFormData({...editFormData, panNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    value={editFormData.aadharNumber || ''}
                    onChange={(e) => setEditFormData({...editFormData, aadharNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editFormData.street || ''}
                    onChange={(e) => setEditFormData({...editFormData, street: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={editFormData.state || ''}
                    onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editFormData.pincode || ''}
                    onChange={(e) => setEditFormData({...editFormData, pincode: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={editFormData.bankName || ''}
                    onChange={(e) => setEditFormData({...editFormData, bankName: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    value={editFormData.accountNumber || ''}
                    onChange={(e) => setEditFormData({...editFormData, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={editFormData.ifscCode || ''}
                    onChange={(e) => setEditFormData({...editFormData, ifscCode: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Holder</label>
                  <input
                    type="text"
                    value={editFormData.accountHolder || ''}
                    onChange={(e) => setEditFormData({...editFormData, accountHolder: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={saveVendorProfile}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🏪 Vendor Management</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{vendors.length} total vendors</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search vendors by name, business, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2 border rounded-lg">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Vendor Applications ({filteredVendors.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendors...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No vendors found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredVendors.map((vendor) => (
              <div 
                key={vendor._id} 
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedVendor(vendor)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                      {getStatusIcon(vendor.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Owner:</strong> {vendor.name}</p>
                        <p><strong>Email:</strong> {vendor.email}</p>
                        <p><strong>Phone:</strong> {vendor.phone}</p>
                      </div>
                      <div>
                        <p><strong>Address:</strong></p>
                        <p>{vendor.address?.street}</p>
                        <p>{vendor.address?.city}, {vendor.address?.state} - {vendor.address?.pincode}</p>
                      </div>
                      <div>
                        <p><strong>Commission:</strong> {vendor.commission || 15}%</p>
                        <p><strong>Products:</strong> {vendor.totalProducts || 0}</p>
                        <p><strong>Revenue:</strong> ₹{vendor.totalRevenue?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Applied: {new Date(vendor.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVendor(vendor)
                      }}
                      className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {vendor.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateVendorStatus(vendor._id, 'approved')
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateVendorStatus(vendor._id, 'rejected')
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}