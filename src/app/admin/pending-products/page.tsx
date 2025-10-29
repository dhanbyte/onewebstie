'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Package, Trash2 } from 'lucide-react'

export default function PendingProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingProducts()
  }, [])

  const fetchPendingProducts = async () => {
    try {
      const response = await fetch('/api/admin/pending-products')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching pending products:', error)
    } finally {
      setLoading(false)
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
        fetchPendingProducts()
      }
    } catch (error) {
      alert('Failed to update product status')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8 text-yellow-500" />
          Pending Products ({products.length})
        </h1>
        <button
          onClick={fetchPendingProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Products</h3>
          <p className="text-gray-500">All vendor products have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">₹{product.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span>{product.stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span>{product.category}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateProductStatus(product._id, 'active')}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-1 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => updateProductStatus(product._id, 'blocked')}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-1 text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                  Submitted: {new Date(product.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}