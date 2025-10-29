'use client'
import { useState, useEffect } from 'react'
import { Building, User, Phone, Mail, MapPin, CreditCard, Save, Edit } from 'lucide-react'

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [newPhoto, setNewPhoto] = useState(null)

  useEffect(() => {
    const vendorId = localStorage.getItem('vendorId')
    if (vendorId) {
      fetchVendorProfile(vendorId)
    }
  }, [])

  const fetchVendorProfile = async (vendorId) => {
    try {
      const response = await fetch(`/api/vendor/profile?vendorId=${vendorId}`)
      const data = await response.json()
      
      if (data.success) {
        setVendor(data.vendor)
        setFormData({
          name: data.vendor.name,
          businessName: data.vendor.businessName,
          phone: data.vendor.phone,
          businessType: data.vendor.businessType || 'Individual',
          gstNumber: data.vendor.gstNumber || '',
          panNumber: data.vendor.panNumber || '',
          street: data.vendor.address?.street || '',
          city: data.vendor.address?.city || '',
          state: data.vendor.address?.state || '',
          pincode: data.vendor.address?.pincode || '',
          bankName: data.vendor.bankDetails?.bankName || '',
          accountNumber: data.vendor.bankDetails?.accountNumber || '',
          ifscCode: data.vendor.bankDetails?.ifscCode || '',
          accountHolder: data.vendor.bankDetails?.accountHolder || '',
          accountType: data.vendor.bankDetails?.accountType || 'Savings'
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId')
      let photoUrl = vendor.profilePhoto
      
      if (newPhoto) {
        try {
          console.log('Uploading new photo...')
          const formDataPhoto = new FormData()
          formDataPhoto.append('file', newPhoto)
          formDataPhoto.append('fileName', `vendor-${vendorId}-${Date.now()}`)
          formDataPhoto.append('folder', '/vendor-profiles')
          
          const uploadResponse = await fetch('/api/imagekit/upload', {
            method: 'POST',
            body: formDataPhoto
          })
          
          const uploadData = await uploadResponse.json()
          console.log('Photo upload response:', uploadData)
          
          if (uploadData.success) {
            photoUrl = uploadData.url
            console.log('Photo uploaded successfully:', photoUrl)
          } else {
            console.error('Photo upload failed:', uploadData.message)
            alert('Photo upload failed: ' + uploadData.message)
          }
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError)
          alert('Photo upload error. Profile will be saved without photo change.')
        }
      }

      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          ...formData,
          profilePhoto: photoUrl,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          },
          bankDetails: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            accountHolder: formData.accountHolder,
            accountType: formData.accountType
          }
        })
      })

      if (response.ok) {
        alert('Profile updated successfully!')
        setEditing(false)
        setNewPhoto(null)
        fetchVendorProfile(vendorId)
      }
    } catch (error) {
      alert('Failed to update profile')
    }
  }

  const changePassword = async (newPassword) => {
    try {
      const vendorId = localStorage.getItem('vendorId')
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          password: newPassword
        })
      })

      if (response.ok) {
        alert('Password changed successfully!')
      } else {
        alert('Failed to change password')
      }
    } catch (error) {
      alert('Error changing password')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <p>Vendor not found. Please login again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendor Profile</h1>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Photo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Photo
            </h2>
            
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 border-2 border-gray-300 rounded-full overflow-hidden">
                {newPhoto ? (
                  <img src={URL.createObjectURL(newPhoto)} alt="New" className="w-full h-full object-cover" />
                ) : vendor.profilePhoto ? (
                  <img src={vendor.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <User className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPhoto(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Upload a new profile photo</p>
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Login Credentials
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vendor ID</label>
                <p className="text-gray-700 font-mono">{vendor.vendorId || 'Not Generated'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <p className="text-gray-700">{vendor.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="••••••••"
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      const newPassword = prompt('Enter new password (min 6 characters):')
                      if (newPassword && newPassword.length >= 6) {
                        changePassword(newPassword)
                      } else if (newPassword) {
                        alert('Password must be at least 6 characters long')
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Business Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.businessName}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                {editing ? (
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="LLP">LLP</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-700">{vendor.businessType || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">GST Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Optional"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.gstNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">PAN Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Optional"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.panNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vendor.status === 'approved' ? 'bg-green-100 text-green-800' :
                  vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {vendor.status}
                </span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.address?.street}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-700">{vendor.address?.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-700">{vendor.address?.state}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pincode</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.address?.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.bankName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Holder</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.accountHolder || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.accountNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">IFSC Code</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.ifscCode || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Type</label>
                {editing ? (
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.accountType || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}