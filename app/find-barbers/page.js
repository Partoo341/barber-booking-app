'use client'
import { useState } from 'react'
import LocationSearch from '../../Components/LocationSearch'
import { supabase } from '@/lib/supabase'

export default function FindBarbers() {
    const [selectedLocation, setSelectedLocation] = useState('')
    const [barbers, setBarbers] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const handleLocationSelect = async (location) => {
        console.log('Location selected:', location)
        setSelectedLocation(location)
        setIsLoading(true)
        
        try {
            // Search for barbers in the selected location - more flexible search
            const { data, error } = await supabase
                .from('barbers')
                .select('*')
                .or(`city.ilike.%${location}%,state.ilike.%${location}%,shop_address.ilike.%${location}%,name.ilike.%${location}%,specialization.ilike.%${location}%`)
            
            if (error) {
                console.error('Supabase error:', error)
                throw error
            }
            
            console.log('Found barbers:', data)
            setBarbers(data || [])
        } catch (error) {
            console.error('Error searching barbers:', error)
            setBarbers([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleUseMyLocation = (location) => {
        console.log('Using location:', location)
        handleLocationSelect(location)
    }

    // Function to format barber address
    const formatBarberAddress = (barber) => {
        const parts = []
        if (barber.shop_address) parts.push(barber.shop_address)
        if (barber.city) parts.push(barber.city)
        if (barber.state) parts.push(barber.state)
        return parts.join(', ') || 'Mahali haijajazwa'
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Location Search Component */}
                <LocationSearch 
                    onLocationSelect={handleLocationSelect}
                    onUseMyLocation={handleUseMyLocation}
                />

                {/* Results Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {selectedLocation && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Inaonyesha kinyozi karibu na: <span className="text-blue-600">{selectedLocation}</span>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {barbers.length} kinyozi wamepatikana
                            </p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Inatafuta kinyozi...</p>
                        </div>
                    ) : barbers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {barbers.map((barber) => (
                                <div key={barber.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                    <h4 className="font-semibold text-lg mb-2 text-gray-900">{barber.name}</h4>
                                    
                                    {barber.specialization && (
                                        <p className="text-gray-700 mb-1">
                                            <span className="font-medium">Aina:</span> {barber.specialization}
                                        </p>
                                    )}
                                    
                                    {barber.experience_years && (
                                        <p className="text-gray-700 mb-1">
                                            <span className="font-medium">Uzoefu:</span> {barber.experience_years} miaka
                                        </p>
                                    )}
                                    
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Mahali:</span> {formatBarberAddress(barber)}
                                    </p>
                                    
                                    {barber.hourly_rate && (
                                        <p className="text-gray-700 mb-3">
                                            <span className="font-medium">Bei:</span> KSH {barber.hourly_rate}/saa
                                        </p>
                                    )}
                                    
                                    <div className="mt-4 flex space-x-2">
                                        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm">
                                            Pata Namba
                                        </button>
                                        <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 text-sm">
                                            Tumia Muda
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : selectedLocation ? (
                        <div className="text-center py-8">
                            <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                                <p className="font-medium">Hakuna kinyozi walipatikana karibu na <span className="font-semibold">{selectedLocation}</span>.</p>
                                <p className="text-sm mt-2">Jaribu kutafuta kwa jina lingine la mji au eneo.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <p className="text-gray-700">Chagua eneo lako ili kuona kinyozi walio karibu nawe.</p>
                                <p className="text-sm text-gray-600 mt-2">Unaweza kutumia eneo lako kiotomatiki au kutafuta mji wako.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
