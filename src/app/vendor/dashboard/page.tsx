'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, TrendingUp, Plus, Edit, Bell, Eye } from 'lucide-react'

export default function VendorDashboard() {
  const [stats, setStats] = useState(null)
  const [vendorInfo, setVendorInfo] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const vendorId = localStorage.getItem('vendorId')
    const vendorEmail = localStorage.getItem('vendorEmail')
    
    if (!vendorId) {
      window.location.href = '/vendor/login'
      return
    }

    setVendorInfo({ id: vendorId, email: vendorEmail })
    fetchVendorData(vendorId)
  }, [])

  const fetchVendorData = async (vendorId) => {
    try {
      console.log('Fetching vendor data for:', vendorId)
      
      // Fetch vendor stats first
      const statsRes = await fetch(`/api/vendor/stats?vendorId=${vendorId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        console.log('Stats response:', statsData)
        setStats(statsData.stats || { totalProducts: 0, totalOrders: 0, totalEarnings: 0, pendingOrders: 0 })
      } else {
        console.error('Stats API failed:', statsRes.status)
        setStats({ totalProducts: 0, totalOrders: 0, totalEarnings: 0, pendingOrders: 0 })
      }
      
      // Fetch notifications (optional)
      try {
        const notificationsRes = await fetch(`/api/vendor/notifications?vendorId=${vendorId}`)
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json()
          setNotifications(notificationsData.notifications || [])
        }
      } catch (notifError) {
        console.log('Notifications not available:', notifError.message)
        setNotifications([])
      }
      
      // Fetch recent orders (optional)
      try {
        const ordersRes = await fetch(`/api/vendor/orders?vendorId=${vendorId}&limit=5`)
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setRecentOrders(ordersData.orders || [])
        }
      } catch (orderError) {
        console.log('Orders not available:', orderError.message)
        setRecentOrders([])
      }
      
    } catch (error) {
      console.error('Error fetching vendor data:', error)
      setStats({ totalProducts: 0, totalOrders: 0, totalEarnings: 0, pendingOrders: 0 })
      setNotifications([])
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch('/api/vendor/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true })
      })
      
      setNotifications(notifications.map(n => 
        n._id === notificationId ? {...n, read: true} : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('vendorId')
    localStorage.removeItem('vendorEmail')
    window.location.href = '/vendor/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">🏪 Vendor Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {vendorInfo?.email}
              </span>
              <button onClick={logout} className="border px-3 py-1 rounded text-sm hover:bg-gray-50">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Products</p>
                <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">₹{stats?.totalEarnings?.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`p-3 rounded-lg border cursor-pointer ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => markNotificationRead(notification._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Link href="/vendor/orders">
                  <button className="text-blue-600 hover:underline text-sm">View All</button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">Order #{order.orderId}</p>
                          <p className="text-xs text-gray-500">{order.customerEmail}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.vendorTotal?.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/vendor/add-product">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <Plus className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Add Product</div>
              </button>
            </Link>
            
            <Link href="/vendor/products">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <Package className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-sm font-medium">My Products</div>
              </button>
            </Link>
            
            <Link href="/vendor/orders">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-sm font-medium">My Orders</div>
              </button>
            </Link>
            
            <Link href="/vendor/earnings">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">Earnings</div>
              </button>
            </Link>
            
            <Link href="/vendor/profile">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <Edit className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                <div className="text-sm font-medium">Edit Profile</div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}