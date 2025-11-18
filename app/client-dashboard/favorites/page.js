// app/client-dashboard/favorites/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function FavoritesPage() {
    const { user } = useAuth()
    const [favorites, setFavorites] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchFavorites()
        }
    }, [user])

    const fetchFavorites = async () => {
        try {
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (clientError) throw clientError

            const { data: favoritesData, error } = await supabase
                .from('favorites')
                .select(`
          id,
          created_at,
          barbers (
            id,
            name,
            shop_name,
            bio,
            avatar_url,
            city,
            state,
            average_rating,
            total_reviews
          )
        `)
                .eq('client_id', client.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setFavorites(favoritesData || [])

        } catch (error) {
            console.error('Error fetching favorites:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const removeFavorite = async (favoriteId) => {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', favoriteId)

            if (error) throw error

            // Refresh favorites
            fetchFavorites()
        } catch (error) {
            console.error('Error removing favorite:', error)
            alert('Failed to remove favorite. Please try again.')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Favorite Barbers</h1>
                <p className="text-gray-600 mt-1">
                    Your saved barbers for quick booking
                </p>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                        <FavoriteCard
                            key={favorite.id}
                            barber={favorite.barbers}
                            favoriteId={favorite.id}
                            onRemove={removeFavorite}
                        />
                    ))}
                </div>
            ) : (
                <EmptyFavoritesState />
            )}
        </div>
    )
}

function FavoriteCard({ barber, favoriteId, onRemove }) {
    const [isRemoving, setIsRemoving] = useState(false)

    const handleRemove = async () => {
        setIsRemoving(true)
        await onRemove(favoriteId)
        setIsRemoving(false)
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={barber.avatar_url || '/default-barber.jpg'}
                        alt={barber.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900">{barber.name}</h3>
                        <p className="text-gray-600 text-sm">{barber.shop_name}</p>
                    </div>
                </div>
                <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-red-600 hover:text-red-800 disabled:text-red-400 transition-colors"
                    title="Remove from favorites"
                >
                    {isRemoving ? '❤️' : '❌'}
                </button>
            </div>

            {barber.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{barber.bio}</p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                    {barber.city && barber.state && (
                        <span>📍 {barber.city}, {barber.state}</span>
                    )}
                </div>
                <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="ml-1">
                        {barber.average_rating || 'No ratings'}
                        {barber.total_reviews > 0 && ` (${barber.total_reviews})`}
                    </span>
                </div>
            </div>

            <div className="flex space-x-2">
                <Link
                    href={`/barbers/${barber.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    View Profile
                </Link>
                <Link
                    href={`/barbers/${barber.id}`}
                    className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                    Book Now
                </Link>
            </div>
        </div>
    )
}

function EmptyFavoritesState() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite barbers yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Save your favorite barbers for quick access and easy booking. You'll find the favorite button on barber profiles.
            </p>
            <Link
                href="/barbers"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
                Find Barbers
            </Link>
        </div>
    )
}