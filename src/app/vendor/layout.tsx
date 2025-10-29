'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building, User, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Public routes that don't require authentication
  const publicRoutes = ['/vendor/login', '/vendor/register']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  useEffect(() => {
    const checkAuth = () => {
      const vendorId = localStorage.getItem('vendorId')
      const vendorEmail = localStorage.getItem('vendorEmail')
      setIsAuthenticated(!!(vendorId && vendorEmail))
      setLoading(false)
    }
    
    checkAuth()
  }, [])
  
  const handleLogout = () => {
    localStorage.removeItem('vendorId')
    localStorage.removeItem('vendorEmail')
    localStorage.removeItem('vendorBrandName')
    localStorage.removeItem('vendorCompanyName')
    window.location.href = '/vendor/login'
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // If not authenticated and not on public route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    if (typeof window !== 'undefined') {
      window.location.href = '/vendor/login'
    }
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vendor Header - Only show if authenticated or on public routes */}
      {(isAuthenticated || isPublicRoute) && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href={isAuthenticated ? "/vendor/dashboard" : "/vendor/login"} className="flex items-center gap-2">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">ShopWave Vendor</span>
              </Link>

              {/* Navigation - Only show if authenticated */}
              {isAuthenticated && (
                <>
                  <nav className="hidden md:flex items-center gap-6">
                    <Link 
                      href="/vendor/dashboard" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/vendor/profile" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Profile
                    </Link>
                  </nav>

                  {/* User Menu */}
                  <div className="flex items-center gap-4">
                    <Link 
                      href="/vendor/profile" 
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <User className="h-5 w-5" />
                      <span className="hidden sm:block">Profile</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="hidden sm:block">Logout</span>
                    </button>
                  </div>
                </>
              )}
              
              {/* Back to website link for public routes */}
              {!isAuthenticated && isPublicRoute && (
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Back to website
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}