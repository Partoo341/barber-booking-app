// components/ReviewModal.jsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function ReviewModal({ booking, onClose, onSuccess }) {
    const { user } = useAuth()
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rating) return

        setIsSubmitting(true)
        try {
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (clientError) throw clientError

            const { error } = await supabase
                .from('reviews')
                .insert([{
                    barber_id: booking.barber_id,
                    client_id: client.id,
                    booking_id: booking.id,
                    rating,
                    comment: comment.trim() || null
                }])

            if (error) throw error

            onSuccess()
        } catch (error) {
            console.error('Error submitting review:', error)
            alert('Failed to submit review. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const barber = booking.barbers
    const service = booking.services

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Barber Info */}
                    <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <img
                            src={barber?.avatar_url || '/default-barber.jpg'}
                            alt={barber?.name}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="font-semibold text-gray-900">{barber?.name}</h3>
                            <p className="text-gray-600 text-sm">{barber?.shop_name}</p>
                            <p className="text-gray-500 text-sm">
                                {service?.name} • {new Date(booking.appointment_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                How would you rate your experience? *
                            </label>
                            <div className="flex justify-center space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="text-4xl transition-transform hover:scale-110 focus:scale-110 focus:outline-none"
                                    >
                                        <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-sm text-gray-600">
                                    {rating === 5 ? 'Excellent' :
                                        rating === 4 ? 'Good' :
                                            rating === 3 ? 'Average' :
                                                rating === 2 ? 'Poor' : 'Terrible'}
                                </span>
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Share your experience (optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="What did you like about the service? Was there anything that could be improved? Your review will help other clients..."
                                maxLength={500}
                            />
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {comment.length}/500 characters
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !rating}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}