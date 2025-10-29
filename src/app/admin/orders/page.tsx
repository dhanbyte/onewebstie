'use client'
import { useState, useEffect } from 'react'
import { Search, Copy, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Order status updated to ${status}`)
        fetchOrders()
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({...selectedOrder, status})
        }
      } else {
        alert('Error updating order status')
      }
    } catch (error) {
      alert('Error updating order status')
    }
  }

  const copyCustomerDetails = (order) => {
    const details = `
Order: ${order.orderId}
Customer: ${order.userId}
${order.shippingAddress ? `
Name: ${order.shippingAddress.name}
Phone: ${order.shippingAddress.phone}
Address: ${order.shippingAddress.address}
City: ${order.shippingAddress.city}
State: ${order.shippingAddress.state}
Pincode: ${order.shippingAddress.pincode}` : ''}
${order.paymentId ? `Payment ID: ${order.paymentId}` : ''}
Total: ₹${order.total}
    `.trim()
    
    navigator.clipboard.writeText(details)
    alert('Customer details copied to clipboard!')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing': return <Package className="h-4 w-4 text-blue-500" />
      case 'shipped': return <Truck className="h-4 w-4 text-purple-500" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedOrder) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedOrder(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Order Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold">Order #{selectedOrder.orderId}</h2>
              <p className="text-gray-600">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">₹{selectedOrder.total?.toLocaleString()}</div>
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                {getStatusIcon(selectedOrder.status)}
                {selectedOrder.status}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Customer Details
              </h3>
              <button
                onClick={() => copyCustomerDetails(selectedOrder)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Copy className="h-4 w-4" />
                Copy Details
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span> {selectedOrder.userId}
                  </div>
                  {selectedOrder.shippingAddress && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Name:</span> {selectedOrder.shippingAddress.name}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {selectedOrder.shippingAddress && (
                    <>
                      <div className="mb-2">
                        <span className="font-medium">Address:</span>
                        <div className="text-gray-700">
                          {selectedOrder.shippingAddress.address}<br/>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br/>
                          Pincode: {selectedOrder.shippingAddress.pincode}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedOrder.paymentId && (
                    <div className="mb-2">
                      <span className="font-medium">Payment ID:</span> {selectedOrder.paymentId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {selectedOrder.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <img 
                    src={item.image || '/images/placeholder.jpg'} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{item.price?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">per item</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Update Order Status</h3>
            <div className="flex gap-3">
              <select
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder.orderId, e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📦 Orders Management</h1>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search orders by ID, customer, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">All Orders ({filteredOrders.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <div 
                key={order._id} 
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                    <p className="text-gray-600">{order.userId}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{order.total?.toLocaleString()}</div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
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