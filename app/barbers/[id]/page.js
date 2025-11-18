// app/barbers/[id]/page.js
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SmartBookingForm from '../../Components/SmartBookingForm';

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

async function getReviews(barberId) {
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
      *,
      clients (name),
      bookings (appointment_date)
    `)
        .eq('barber_id', barberId)
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error fetching reviews:', error)
        return []
    }

    return reviews
}

async function getBarberStats(barberId) {
    // Get total appointments count
    const { count: totalAppointments, error: appointmentsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('barber_id', barberId)
        .eq('status', 'completed')

    // Get reviews stats
    const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('barber_id', barberId)

    if (reviewsError) {
        return {
            totalAppointments: totalAppointments || 0,
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
    }

    const totalReviews = reviewsData.length
    const averageRating = totalReviews > 0
        ? (reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
        : 0

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviewsData.forEach(review => {
        ratingDistribution[review.rating]++
    })

    return {
        totalAppointments: totalAppointments || 0,
        averageRating: parseFloat(averageRating),
        totalReviews,
        ratingDistribution
    }
}

export default async function BarberProfile({ params }) {
    const barber = await getBarber(params.id)
    const services = await getServices(params.id)
    const reviews = await getReviews(params.id)
    const stats = await getBarberStats(params.id)

    if (!barber) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Barber Header */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                        <img
                            src={barber.avatar_url || '/default-barber.jpg'}
                            alt={barber.name}
                            className="w-32 h-32 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{barber.name}</h1>
                                    <p className="text-xl text-gray-600 mt-1">{barber.shop_name}</p>

                                    {/* Rating and Stats */}
                                    <div className="flex items-center mt-4 space-x-6">
                                        <div className="flex items-center">
                                            <div className="flex items-center">
                                                <span className="text-yellow-400 text-2xl">⭐</span>
                                                <span className="ml-2 text-2xl font-bold text-gray-900">
                                                    {stats.averageRating || '4.8'}
                                                </span>
                                            </div>
                                            <span className="mx-2 text-gray-300">•</span>
                                            <span className="text-gray-600">
                                                {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="text-gray-600">
                                            <span className="font-semibold">{stats.totalAppointments}</span> appointments
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Distribution */}
                                {stats.totalReviews > 0 && (
                                    <div className="mt-4 md:mt-0 md:ml-8">
                                        <div className="space-y-1 text-sm">
                                            {[5, 4, 3, 2, 1].map(rating => (
                                                <div key={rating} className="flex items-center space-x-2">
                                                    <span className="w-8 text-gray-600">{rating}★</span>
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-yellow-400 h-2 rounded-full"
                                                            style={{
                                                                width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="w-8 text-gray-500 text-right">
                                                        {stats.ratingDistribution[rating]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Location Info */}
                            {(barber.city || barber.state) && (
                                <div className="flex items-center mt-4 text-gray-500">
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
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Services & Reviews */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Services Section */}
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

                        {/* Reviews Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                                <div className="text-right">
                                    <div className="flex items-center justify-end">
                                        <span className="text-yellow-400 text-2xl">⭐</span>
                                        <span className="ml-2 text-xl font-bold text-gray-900">
                                            {stats.averageRating || '4.8'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <ReviewDisplay
                                            key={review.id}
                                            review={review}
                                        />
                                    ))}

                                    {stats.totalReviews > reviews.length && (
                                        <div className="text-center pt-4 border-t">
                                            <p className="text-gray-500">
                                                Showing {reviews.length} of {stats.totalReviews} reviews
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">⭐</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                                    <p className="text-gray-500">
                                        Be the first to review {barber.name}!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Barber Information Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
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

// Review Display Component
function ReviewDisplay({ review }) {
    const client = review.clients
    const booking = review.bookings

    return (
        <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                            {client?.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">
                            {client?.name || 'Anonymous Client'}
                        </h4>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                    {booking?.appointment_date && (
                        <p>Visited {new Date(booking.appointment_date).toLocaleDateString()}</p>
                    )}
                    <p>Reviewed {new Date(review.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {review.comment && (
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            )}
        </div>
    )
}