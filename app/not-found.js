// app/not-found.js
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-8 max-w-md">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="space-y-4">
                    <Link
                        href="/"
                        className="block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/barbers"
                        className="block border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Find Barbers
                    </Link>
                </div>
            </div>
        </div>
    )
}