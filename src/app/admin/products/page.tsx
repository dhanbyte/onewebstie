'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Fetch both regular and vendor products
      const [regularRes, vendorRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/vendor-products')
      ])
      
      const regularData = await regularRes.json()
      const vendorData = await vendorRes.json()
      
      const allProducts = [
        ...(regularData.products || []),
        ...(vendorData.products || []).map(p => ({...p, isVendorProduct: true}))
      ]
      
      setProducts(allProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const updateProductStatus = async (productId, status, isVendorProduct) => {
    try {
      const endpoint = isVendorProduct ? '/api/admin/vendor-products' : '/api/admin/products'
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status })
      })
      
      if (response.ok) {
        alert(`Product ${status} successfully`)
        fetchProducts()
      }
    } catch (error) {
      alert('Failed to update product status')
    }
  }

  const deleteProduct = async (id, isVendorProduct) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const endpoint = isVendorProduct ? '/api/admin/vendor-products' : '/api/admin/products'
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id })
      })
      
      if (response.ok) {
        alert('Product deleted successfully!')
        fetchProducts()
      }
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛍️ Products</h1>
        <Link href="/admin/add-product">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add Product
          </button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No products found</p>
              </div>
            ) : null}
            {products.map((product) => (
              <div key={product._id || product.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.images?.[0] || product.image || '/images/placeholder.jpg'} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        {product.isVendorProduct && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            Vendor Product
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{product.category}</p>
                      <p className="text-green-600 font-medium">
                        ₹{(product.price?.discounted || product.price?.original || product.price || 0).toLocaleString()}
                      </p>
                      {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
                      {product.vendorId && (
                        <p className="text-xs text-gray-400">Vendor ID: {product.vendorId}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${(product.quantity || product.stock || 0) > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                      Stock: {product.quantity || product.stock || 0}
                    </p>
                    
                    {/* Status Dropdown for Vendor Products */}
                    {product.isVendorProduct && (
                      <div className="mt-2 mb-2">
                        <select
                          value={product.status || 'pending'}
                          onChange={(e) => updateProductStatus(product._id, e.target.value, true)}
                          className={`px-2 py-1 rounded text-xs border ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'blocked' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="pending">pending</option>
                          <option value="active">approved</option>
                          <option value="blocked">blocked</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200">
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteProduct(product._id || product.id, product.isVendorProduct)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
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