'use client'
import { useState } from 'react'

export default function LocationSearch({ onLocationSelect, onUseMyLocation }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [isLocating, setIsLocating] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            onLocationSelect(searchQuery)
        }
    }

    const handleUseMyLocation = async () => {
        setIsLocating(true)
        try {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser')
                return
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    enableHighAccuracy: true
                })
            })

            const { latitude, longitude } = position.coords
            
            // Reverse geocode to get location name
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            const data = await response.json()
            
            const locationName = data.city || data.locality || data.principalSubdivision || 'Your Location'
            onLocationSelect(locationName)
            
        } catch (error) {
            console.error('Error getting location:', error)
            if (error.code === error.PERMISSION_DENIED) {
                alert('Location access denied. Please enable location permissions or search manually.')
            } else {
                alert('Unable to get your location. Please search manually.')
            }
        } finally {
            setIsLocating(false)
        }
    }

    // Kenya major cities and towns
    const kenyaCities = [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
        'Malindi', 'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Machakos',
        'Meru', 'Lamu', 'Isiolo', 'Nanyuki', 'Naivasha', 'Kericho',
        'Embu', 'Voi', 'Kilifi', 'Narok', 'Kitui', 'Bungoma', 'Busia'
    ]

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pata Kinyozi Karibu Nawe</h2>
            <p className="text-gray-600 mb-4">Find barbershops near your location in Kenya</p>

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="flex">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Andika jina la mji, eneo au anwani..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors font-medium"
                        >
            Tafuta
                        </button>
                    </form>
                </div>

                {/* Use My Location Button */}
                <button
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                    {isLocating ? '📡 Inatafuta...' : '📍 Tumia Eneo Langu'}
                </button>
            </div>

            {/* Popular Kenya Cities */}
            <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3">Miji maarufu Kenya:</p>
                <div className="flex flex-wrap gap-2">
                    {kenyaCities.map((city) => (
                        <button
                            key={city}
                            onClick={() => onLocationSelect(city)}
                            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors border border-gray-300 hover:border-gray-400"
                        >
                            {city}
                        </button>
                    ))}
                </div>
            </div>

            {/* Counties Section */}
            <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3">Kaunti kubwa:</p>
                <div className="flex flex-wrap gap-2">
                    {['Nairobi County', 'Mombasa County', 'Kisumu County', 'Nakuru County', 'Uasin Gishu', 'Kilifi County', 'Kakamega County', 'Meru County'].map((county) => (
                        <button
                            key={county}
                            onClick={() => onLocationSelect(county)}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full transition-colors border border-blue-200"
                        >
                            {county}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
