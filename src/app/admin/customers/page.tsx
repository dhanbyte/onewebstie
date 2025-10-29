'use client'
import { useState, useEffect } from 'react'
import { Users, Search, Mail, Phone, Calendar, ShoppingBag, Coins, Gift, Copy } from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      const data = await response.json()
      
      if (data.success) {
        setCustomers(data.customers)
      } else {
        setCustomers([])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const copyCustomerInfo = (customer) => {
    const info = `
Customer: ${customer.name}
Email: ${customer.email}
${customer.phone ? `Phone: ${customer.phone}` : ''}
Referral Code: ${customer.referralCode}
Total Orders: ${customer.totalOrders}
Total Spent: ₹${customer.totalSpent.toLocaleString()}
Referral Balance: ₹${customer.referralBalance}
Joined: ${new Date(customer.joinedDate).toLocaleDateString()}
    `.trim()
    
    navigator.clipboard.writeText(info)
    alert('Customer info copied to clipboard!')
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedCustomer) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedCustomer(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Customers
          </button>
          <h1 className="text-3xl font-bold">Customer Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Customer Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
              <p className="text-gray-600">{selectedCustomer.email}</p>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                selectedCustomer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedCustomer.status}
              </div>
            </div>
            <button
              onClick={() => copyCustomerInfo(selectedCustomer)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              <Copy className="h-4 w-4" />
              Copy Info
            </button>
          </div>

          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Orders</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💰</span>
                <span className="font-medium">Total Spent</span>
              </div>
              <div className="text-2xl font-bold text-green-600">₹{selectedCustomer.totalSpent.toLocaleString()}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Coins</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{selectedCustomer.coins || 0}</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Admin Status</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{selectedCustomer.isAdmin ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Joined: {new Date(selectedCustomer.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Referral Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Referral Code:</span>
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                    {selectedCustomer.referralCode}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Earned:</span>
                  <span className="ml-2 text-green-600">₹{selectedCustomer.totalEarned}</span>
                </div>
                <div>
                  <span className="font-medium">Purchase Status:</span>
                  <span className={`ml-2 ${selectedCustomer.hasMadePurchase ? 'text-green-600' : 'text-orange-600'}`}>
                    {selectedCustomer.hasMadePurchase ? 'Has made purchase' : 'No purchase yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Last Activity: {new Date(selectedCustomer.lastActivity).toLocaleDateString()}</div>
              {selectedCustomer.lastOrder && (
                <div>Last Order: {new Date(selectedCustomer.lastOrder).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👥 Customers</h1>
        <span className="text-sm text-gray-600">{customers.length} total customers</span>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search customers by name, email, or referral code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Customer List ({filteredCustomers.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No customers found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredCustomers.map((customer) => (
              <div 
                key={customer._id} 
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-gray-600">{customer.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>📦 {customer.totalOrders} orders</span>
                      <span>💰 ₹{customer.totalSpent.toLocaleString()}</span>
                      <span>🎁 {customer.referralCount} referrals</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                        {customer.referralCode}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Joined: {new Date(customer.joinedDate).toLocaleDateString()}
                    </p>
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