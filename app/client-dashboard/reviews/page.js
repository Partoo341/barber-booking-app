// app/client-dashboard/reviews/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function ReviewsPage() {
    const { user } = useAuth()
    const [reviews, setReviews] = useState([])
    const [bookingsWithoutReviews, setBookingsWithoutReviews] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (clientError) throw clientError

            // Fetch user's reviews
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
          *,
          barbers (name, shop_name, avatar_url),
          bookings (appointment_date, appointment_time, services(name))
        `)
                .eq('client_id', client.id)
                .order('created_at', { ascending: false })

            if (reviewsError) throw reviewsError

            // Fetch completed bookings without reviews
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
          *,
          barbers (name, shop_name, avatar_url),
          services (name)
        `)
                .eq('client_id', client.id)
                .eq('status', 'completed')
                .lte('appointment_date', new Date().toISOString().split('T')[0])
                .order('appointment_date', { ascending: false })

            if (bookingsError) throw bookingsError

            // Filter out bookings that already have reviews
            const reviewedBookingIds = new Set(reviewsData?.map(review => review.booking_id) || [])
            const bookingsWithoutReviews = bookingsData?.filter(booking =>
                !reviewedBookingIds.has(booking.id)
            ) || []

            setReviews(reviewsData || [])
            setBookingsWithoutReviews(bookingsWithoutReviews)

        } catch (error) {
            console.error('Error fetching reviews data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const openReviewModal = (booking) => {
        setSelectedBooking(booking)
        setShowReviewModal(true)
    }

    const closeReviewModal = () => {
        setShowReviewModal(false)
        setSelectedBooking(null)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
                <p className="text-gray-600 mt-1">
                    Share your experiences and help other clients find great barbers
                </p>
            </div>

            {/* Pending Reviews Section */}
            {bookingsWithoutReviews.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Write a Review ({bookingsWithoutReviews.length})
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You have appointments waiting for your review. Share your experience to help the barber and other clients.
                    </p>

                    <div className="space-y-4">
                        {bookingsWithoutReviews.slice(0, 3).map((booking) => (
                            <BookingReviewCard
                                key={booking.id}
                                booking={booking}
                                onReview={openReviewModal}
                            />
                        ))}
                    </div>

                    {bookingsWithoutReviews.length > 3 && (
                        <div className="mt-4 text-center">
                            <p className="text-gray-500 text-sm">
                                And {bookingsWithoutReviews.length - 3} more appointments to review...
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Existing Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    My Reviews ({reviews.length})
                </h2>

                {reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onUpdate={fetchData}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyReviewsState
                        hasPendingReviews={bookingsWithoutReviews.length > 0}
                    />
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedBooking && (
                <ReviewModal
                    booking={selectedBooking}
                    onClose={closeReviewModal}
                    onSuccess={() => {
                        closeReviewModal()
                        fetchData()
                    }}
                />
            )}
        </div>
    )
}

function BookingReviewCard({ booking, onReview }) {
    const barber = booking.barbers
    const service = booking.services

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
                <img
                    src={barber?.avatar_url || '/default-barber.jpg'}
                    alt={barber?.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                    <h3 className="font-medium text-gray-900">{barber?.name}</h3>
                    <p className="text-sm text-gray-500">{service?.name}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(booking.appointment_date).toLocaleDateString()} at {booking.appointment_time}
                    </p>
                </div>
            </div>
            <button
                onClick={() => onReview(booking)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                Write Review
            </button>
        </div>
    )
}

function ReviewCard({ review, onUpdate }) {
    const barber = review.barbers
    const booking = review.bookings

    return (
        <div className="border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={barber?.avatar_url || '/default-barber.jpg'}
                        alt={barber?.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900">{barber?.name}</h3>
                        <p className="text-gray-600 text-sm">{barber?.shop_name}</p>
                        <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                    <p>{new Date(review.created_at).toLocaleDateString()}</p>
                    {booking && (
                        <p>{new Date(booking.appointment_date).toLocaleDateString()}</p>
                    )}
                </div>
            </div>

            {review.comment && (
                <p className="text-gray-700 mb-4">{review.comment}</p>
            )}

            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                    Service: {booking?.services?.name || 'Haircut'}
                </span>
                <span>
                    Reviewed {new Date(review.created_at).toLocaleDateString()}
                </span>
            </div>
        </div>
    )
}

function EmptyReviewsState({ hasPendingReviews }) {
    return (
        <div className="text-center py-8">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasPendingReviews ? 'Write your first review!' : 'No reviews yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {hasPendingReviews
                    ? 'You have appointments waiting for your review. Share your experience to help other clients find great barbers.'
                    : 'After your appointments are completed, you can come back here to leave reviews for your barbers.'
                }
            </p>
            {!hasPendingReviews && (
                <a
                    href="/client-dashboard/bookings?filter=past"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
                >
                    View Past Appointments
                </a>
            )}
        </div>
    )
}