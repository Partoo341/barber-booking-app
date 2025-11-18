// app/error.js
'use client'

export default function Error({ error, reset }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
                <div className="text-6xl mb-4">😵</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
                <p className="text-gray-600 mb-6">
                    We encountered an unexpected error. Please try again.
                </p>
                <button
                    onClick={() => reset()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Try Again
                </button>
            </div>
        </div>
    )
}