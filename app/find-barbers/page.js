'use client'
import { useState } from 'react'
import LocationSearch from '../../Components/LocationSearch'
import { supabase } from '@/lib/supabase'

export default function FindBarbers() {
    const [selectedLocation, setSelectedLocation] = useState('')
    const [barbers, setBarbers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showPhoneModal, setShowPhoneModal] = useState(false)
    const [selectedBarber, setSelectedBarber] = useState(null)
    const [showBookingModal, setShowBookingModal] = useState(false)

    const handleLocationSelect = async (location) => {
        console.log('Location selected:', location)
        setSelectedLocation(location)
        setIsLoading(true)
        
        try {
            const { data, error } = await supabase
                .from('barbers')
                .select('*')
                .or(`city.ilike.%${location}%,state.ilike.%${location}%,shop_address.ilike.%${location}%,name.ilike.%${location}%,specialization.ilike.%${location}%`)
            
            if (error) throw error
            setBarbers(data || [])
        } catch (error) {
            console.error('Error searching barbers:', error)
            setBarbers([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleUseMyLocation = (location) => {
        handleLocationSelect(location)
    }

    // Handle Get Number button
    const handleGetNumber = (barber) => {
        setSelectedBarber(barber)
        setShowPhoneModal(true)
    }

    // Handle Book Appointment button
    const handleBookAppointment = (barber) => {
        setSelectedBarber(barber)
        setShowBookingModal(true)
    }

    // Format barber address
    const formatBarberAddress = (barber) => {
        const parts = []
        if (barber.shop_address) parts.push(barber.shop_address)
        if (barber.city) parts.push(barber.city)
        if (barber.state) parts.push(barber.state)
        return parts.join(', ') || 'Location not specified'
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
                                Showing barbers near: <span className="text-blue-600">{selectedLocation}</span>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Found {barbers.length} barbers
                            </p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Searching for barbers...</p>
                        </div>
                    ) : barbers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {barbers.map((barber) => (
                                <div key={barber.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                    <h4 className="font-semibold text-lg mb-2 text-gray-900">{barber.name}</h4>
                                    
                                    {barber.specialization && (
                                        <p className="text-gray-700 mb-1">
                                            <span className="font-medium">Specialty:</span> {barber.specialization}
                                        </p>
                                    )}
                                    
                                    {barber.experience_years && (
                                        <p className="text-gray-700 mb-1">
                                            <span className="font-medium">Experience:</span> {barber.experience_years} years
                                        </p>
                                    )}
                                    
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Location:</span> {formatBarberAddress(barber)}
                                    </p>
                                    
                                    {barber.hourly_rate && (
                                        <p className="text-gray-700 mb-3">
                                            <span className="font-medium">Rate:</span> KSH {barber.hourly_rate}/hour
                                        </p>
                                    )}
                                    
                                    <div className="mt-4 flex space-x-2">
                                        <button 
                                            onClick={() => handleGetNumber(barber)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm transition-colors"
                                        >
                                            Get Number
                                        </button>
                                        <button 
                                            onClick={() => handleBookAppointment(barber)}
                                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 text-sm transition-colors"
                                        >
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : selectedLocation ? (
                        <div className="text-center py-8">
                            <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                                <p className="font-medium">No barbers found near <span className="font-semibold">{selectedLocation}</span>.</p>
                                <p className="text-sm mt-2">Try searching with a different city or area name.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <p className="text-gray-700">Select your location to see barbers near you.</p>
                                <p className="text-sm text-gray-600 mt-2">You can use your current location or search for a city.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Number Modal */}
                {showPhoneModal && selectedBarber && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">{selectedBarber.name}'s Contact</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                                            {selectedBarber.phone || 'Not available'}
                                        </span>
                                        {selectedBarber.phone && (
                                            <a 
                                                href={`tel:${selectedBarber.phone}`}
                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                                            >
                                                Call
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-600">{selectedBarber.email}</p>
                                </div>

                                {selectedBarber.shop_address && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <p className="text-gray-600">{formatBarberAddress(selectedBarber)}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={() => setShowPhoneModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
                                >
                                    Close
                                </button>
                                {selectedBarber.phone && (
                                    <a 
                                        href={`https://wa.me/${selectedBarber.phone.replace('+', '').replace(/\s/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors text-center"
                                    >
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Modal */}
                {showBookingModal && selectedBarber && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">Book with {selectedBarber.name}</h3>
                            
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select a time</option>
                                        <option value="09:00">9:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="13:00">1:00 PM</option>
                                        <option value="14:00">2:00 PM</option>
                                        <option value="15:00">3:00 PM</option>
                                        <option value="16:00">4:00 PM</option>
                                        <option value="17:00">5:00 PM</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Required</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Haircut, Beard trim, etc."
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </form>

                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Booking request sent! The barber will contact you to confirm.');
                                        setShowBookingModal(false);
                                    }}
                                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                                >
                                    Request Booking
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
