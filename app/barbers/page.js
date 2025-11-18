// app/barbers/[id]/page.js
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SmartBookingForm from '../Components/SmartBookingForm';

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

async function getServices(barberId) {
    const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('barber_id', barberId)

    if (error) {
        console.error('Error fetching services:', error)
        return []
    }

    return services
}

export default async function BarberProfile({ params }) {
    const barber = await getBarber(params.id)
    const services = await getServices(params.id)

    if (!barber) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Barber Header */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                        <img
                            src={barber.avatar_url || '/default-barber.jpg'}
                            alt={barber.name}
                            className="w-32 h-32 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{barber.name}</h1>
                            <p className="text-xl text-gray-600 mt-1">{barber.shop_name}</p>

                            {/* Location Info */}
                            {(barber.city || barber.state) && (
                                <div className="flex items-center mt-2 text-gray-500">
                                    <span className="mr-1">📍</span>
                                    <span>
                                        {barber.city}{barber.city && barber.state ? ', ' : ''}{barber.state}
                                    </span>
                                </div>
                            )}

                            <p className="text-gray-500 mt-4">{barber.bio}</p>

                            {/* Contact Info */}
                            <div className="flex items-center mt-4 space-x-4">
                                {barber.phone && (
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-1">📞</span>
                                        <span>{barber.phone}</span>
                                    </div>
                                )}
                                {barber.email && (
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-1">✉️</span>
                                        <span>{barber.email}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center mt-4">
                                <span className="text-yellow-400">⭐</span>
                                <span className="text-gray-600 ml-1">4.8 (124 reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Services Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Services & Prices</h2>

                            {services.length > 0 ? (
                                <div className="space-y-4">
                                    {services.map((service) => (
                                        <div key={service.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                                                {service.description && (
                                                    <p className="text-gray-500 text-sm mt-1">{service.description}</p>
                                                )}
                                                <p className="text-gray-500 text-sm mt-1">{service.duration_minutes} minutes</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gray-900">${service.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">✂️</div>
                                    <p className="text-gray-500">No services listed yet.</p>
                                    <p className="text-gray-400 text-sm mt-2">Check back later for available services.</p>
                                </div>
                            )}
                        </div>

                        {/* Barber Information Section */}
                        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {barber.name}</h2>
                            <div className="space-y-4">
                                {barber.bio ? (
                                    <p className="text-gray-600 leading-relaxed">{barber.bio}</p>
                                ) : (
                                    <p className="text-gray-500 italic">No bio provided.</p>
                                )}

                                {/* Business Hours */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                                    <div className="text-sm text-gray-600">
                                        {barber.working_hours ? (
                                            <div className="space-y-1">
                                                {Object.entries(barber.working_hours).map(([day, hours]) => (
                                                    <div key={day} className="flex justify-between">
                                                        <span className="capitalize">{day}:</span>
                                                        <span>
                                                            {hours.enabled
                                                                ? `${hours.start} - ${hours.end}`
                                                                : 'Closed'
                                                            }
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Hours not specified</p>
                                        )}
                                    </div>
                                </div>

                                {/* Location Details */}
                                {(barber.address || barber.city) && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                                        <div className="text-sm text-gray-600">
                                            {barber.address && <p>{barber.address}</p>}
                                            {(barber.city || barber.state || barber.zip_code) && (
                                                <p>
                                                    {barber.city}{barber.city && barber.state ? ', ' : ''}
                                                    {barber.state} {barber.zip_code}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Booking Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            {services.length > 0 ? (
                                <SmartBookingForm barber={barber} services={services} />
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">⏰</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Available</h3>
                                    <p className="text-gray-500 text-sm">
                                        This barber hasn't set up their services yet. Please check back later.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}