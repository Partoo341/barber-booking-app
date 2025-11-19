import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

async function getBarber(id) {
    const { data: barber, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching barber:', error)
        return null
    }

    return barber
}

export default async function BarberProfile({ params }) {
    const barber = await getBarber(params.id)

    if (!barber) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Barber Header */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                            {barber.profile_image ? (
                                <img
                                    src={barber.profile_image}
                                    alt={barber.name}
                                    className="w-32 h-32 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-blue-600 text-4xl">💈</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{barber.name}</h1>
                            
                            {barber.specialization && (
                                <p className="text-xl text-blue-600 mt-1 font-medium">{barber.specialization}</p>
                            )}

                            {/* Stats */}
                            <div className="flex items-center mt-4 space-x-6">
                                {barber.experience_years && (
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-1">⏳</span>
                                        <span>{barber.experience_years} years experience</span>
                                    </div>
                                )}
                                {barber.hourly_rate && (
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-1">💰</span>
                                        <span>KSH {barber.hourly_rate}/hour</span>
                                    </div>
                                )}
                            </div>

                            {/* Location Info */}
                            {(barber.city || barber.state) && (
                                <div className="flex items-center mt-4 text-gray-500">
                                    <span className="mr-2">📍</span>
                                    <span>
                                        {barber.city}{barber.city && barber.state ? ', ' : ''}{barber.state}
                                    </span>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="flex items-center mt-4 space-x-4">
                                {barber.phone && (
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-2">📞</span>
                                        <span>{barber.phone}</span>
                                    </div>
                                )}
                                {barber.email && (
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-2">✉️</span>
                                        <span>{barber.email}</span>
                                    </div>
                                )}
                            </div>

                            {barber.bio && (
                                <p className="text-gray-600 mt-4 leading-relaxed">{barber.bio}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Barber Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {barber.name}</h2>
                            
                            {barber.bio ? (
                                <p className="text-gray-600 leading-relaxed">{barber.bio}</p>
                            ) : (
                                <p className="text-gray-500 italic">No bio provided.</p>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {barber.specialization && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-blue-900 mb-1">Specialization</h3>
                                        <p className="text-blue-700">{barber.specialization}</p>
                                    </div>
                                )}
                                
                                {barber.experience_years && (
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-green-900 mb-1">Experience</h3>
                                        <p className="text-green-700">{barber.experience_years} years</p>
                                    </div>
                                )}
                                
                                {barber.hourly_rate && (
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-purple-900 mb-1">Hourly Rate</h3>
                                        <p className="text-purple-700">KSH {barber.hourly_rate}</p>
                                    </div>
                                )}
                                
                                {(barber.city || barber.state) && (
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-orange-900 mb-1">Location</h3>
                                        <p className="text-orange-700">
                                            {barber.city}{barber.city && barber.state ? ', ' : ''}{barber.state}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Shop Address */}
                            {barber.shop_address && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Shop Location</h3>
                                    <p className="text-gray-600">{barber.shop_address}</p>
                                </div>
                            )}
                        </div>

                        {/* Services Section - Simplified */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>
                            
                            <div className="space-y-4">
                                {/* Default services based on specialization */}
                                {barber.specialization && (
                                    <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg">{barber.specialization}</h3>
                                            <p className="text-gray-500 text-sm mt-1">Professional service</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-900">
                                                {barber.hourly_rate ? `KSH ${barber.hourly_rate}` : 'Contact for price'}
                                            </p>
                                            <p className="text-gray-500 text-sm">per hour</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Additional common services */}
                                <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">Haircut & Styling</h3>
                                        <p className="text-gray-500 text-sm mt-1">Standard haircut with styling</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900">
                                            {barber.hourly_rate ? `KSH ${Math.round(barber.hourly_rate * 0.5)}` : 'Contact for price'}
                                        </p>
                                        <p className="text-gray-500 text-sm">~30 minutes</p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">Beard Trim</h3>
                                        <p className="text-gray-500 text-sm mt-1">Beard shaping and trimming</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900">
                                            {barber.hourly_rate ? `KSH ${Math.round(barber.hourly_rate * 0.3)}` : 'Contact for price'}
                                        </p>
                                        <p className="text-gray-500 text-sm">~20 minutes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Appointment</h2>
                            
                            <div className="space-y-4">
                                <div className="text-center py-4">
                                    <div className="text-4xl mb-4">📅</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact to Book</h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Get in touch with {barber.name} to schedule your appointment
                                    </p>
                                    
                                    <div className="space-y-3">
                                        {barber.phone && (
                                            <a 
                                                href={`tel:${barber.phone}`}
                                                className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                                            >
                                                📞 Call Now
                                            </a>
                                        )}
                                        
                                        {barber.phone && (
                                            <a 
                                                href={`https://wa.me/${barber.phone.replace('+', '').replace(/\s/g, '')}?text=Hi ${barber.name}, I would like to book an appointment`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors text-center"
                                            >
                                                💬 WhatsApp
                                            </a>
                                        )}
                                        
                                        {barber.email && (
                                            <a 
                                                href={`mailto:${barber.email}?subject=Appointment Booking&body=Hi ${barber.name}, I would like to book an appointment`}
                                                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                                            >
                                                ✉️ Email
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
