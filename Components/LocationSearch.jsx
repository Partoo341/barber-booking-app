// components/LocationSearch.jsx
'use client'
import { useState } from 'react'

export default function LocationSearch({ onLocationSelect, onUseMyLocation }) {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            onLocationSelect(searchQuery)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Barbers Near You</h2>

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="flex">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter city, zip code, or address..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Use My Location Button */}
                <button
                    onClick={onUseMyLocation}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                >
                    📍 Use My Location
                </button>
            </div>

            {/* Popular Cities */}
            <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Popular cities:</p>
                <div className="flex flex-wrap gap-2">
                    {['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'].map((city) => (
                        <button
                            key={city}
                            onClick={() => onLocationSelect(city)}
                            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                        >
                            {city}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}