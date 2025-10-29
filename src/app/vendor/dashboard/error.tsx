'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
        <p className="text-gray-600 mb-4">Something went wrong loading the dashboard</p>
        <button 
          onClick={reset}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.href = '/vendor/login'}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}