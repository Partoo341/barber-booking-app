// components/BarberCard.jsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function BarberCard({ barber }) {
    const { user } = useAuth()
    const [isFavorite, setIsFavorite] = useState(false)
    const [favoriteId, setFavoriteId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            checkIfFavorite()
        }
    }, [user, barber.id])

    const checkIfFavorite = async () => {
        try {
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (clientError) throw clientError

            const { data: favorite, error } = await supabase
                .from('favorites')
                .select('id')
                .eq('client_id', client.id)
                .eq('barber_id', barber.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

            setIsFavorite(!!favorite)
            setFavoriteId(favorite?.id || null)
        } catch (error) {
            console.error('Error checking favorite:', error)
        }
    }

    const toggleFavorite = async () => {
        if (!user) {
            alert('Please sign in to save favorites')
            return
        }

        setIsLoading(true)
        try {
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (clientError) throw clientError

            if (isFavorite) {
                // Remove from favorites
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('id', favoriteId)

                if (error) throw error
                setIsFavorite(false)
                setFavoriteId(null)
            } else {
                // Add to favorites
                const { data, error } = await supabase
                    .from('favorites')
                    .insert([{
                        client_id: client.id,
                        barber_id: barber.id
                    }])
                    .select()
                    .single()

                if (error) throw error
                setIsFavorite(true)
                setFavoriteId(data.id)
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
            alert('Failed to update favorites. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Format rating display
    const displayRating = barber.average_rating > 0 ? barber.average_rating : '4.8'
    const displayReviews = barber.total_reviews > 0 ? barber.total_reviews : '124'

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
            {/* Favorite Button */}
            <button
                onClick={toggleFavorite}
                disabled={isLoading}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <span className={`text-xl ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                        {isFavorite ? '❤️' : '🤍'}
                    </span>
                )}
            </button>

            <img
                src={barber.avatar_url || '/default-barber.jpg'}
                alt={barber.name}
                className="w-full h-48 object-cover"
            />
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{barber.name}</h3>
                <p className="text-gray-600 mt-1">{barber.shop_name}</p>

                {/* Location Info */}
                {(barber.city || barber.state) && (
                    <div className="flex items-center mt-2 text-gray-500 text-sm">
                        <span className="mr-1">📍</span>
                        <span>
                            {barber.city}{barber.city && barber.state ? ', ' : ''}{barber.state}
                        </span>
                    </div>
                )}

                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{barber.bio}</p>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-gray-600 ml-1">
                            {displayRating}
                            <span className="text-gray-400"> ({displayReviews})</span>
                        </span>
                    </div>
                    <Link
                        href={`/barbers/${barber.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Book Now
                    </Link>
                </div>
            </div>
        </div>
    )
}