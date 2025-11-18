// app/client-dashboard/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function ClientDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        totalAppointments: 0,
        favoriteBarbers: 0,
        reviewsGiven: 0
    })
    const [upcomingAppointments, setUpcomingAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        try {
            // Get client profile
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (clientError) throw clientError

            // Get upcoming appointments
            const today = new Date().toISOString().split('T')[0]
            const { data: appointments, error: appointmentsError } = await supabase
                .from('bookings')
                .select(`
          *,
          barbers (name, shop_name, avatar_url),
          services (name, price)
        `)
                .eq('client_id', client.id)
                .gte('appointment_date', today)
                .eq('status', 'confirmed')
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true })
                .limit(3)

            if (appointmentsError) throw appointmentsError

            // Get total appointments count
            const { count: totalAppointments, error: countError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('client_id', client.id)

            if (countError) throw countError

            // Get favorites count
            const { count: favoriteBarbers, error: favoritesError } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('client_id', client.id)

            if (favoritesError) console.log('No favorites yet:', favoritesError) // This might fail if table doesn't exist yet

            // Get reviews count
            const { count: reviewsGiven, error: reviewsError } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('client_id', client.id)

            if (reviewsError) console.log('No reviews yet:', reviewsError) // This might fail if table doesn't exist yet

            setStats({
                upcomingAppointments: appointments?.length || 0,
                totalAppointments: totalAppointments || 0,
                favoriteBarbers: favoriteBarbers || 0,
                reviewsGiven: reviewsGiven || 0
            })

            setUpcomingAppointments(appointments || [])

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsLoading(false)
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
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to Your Dashboard
                </h1>
                <p className="text-gray-600">
                    Manage your appointments, favorite barbers, and reviews all in one place.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Upcoming Appointments"
                    value={stats.upcomingAppointments}
                    icon="📅"
                    color="blue"
                    href="/client-dashboard/bookings"
                />
                <StatCard
                    title="Total Appointments"
                    value={stats.totalAppointments}
                    icon="📊"
                    color="green"
                    href="/client-dashboard/bookings"
                />
                <StatCard
                    title="Favorite Barbers"
                    value={stats.favoriteBarbers}
                    icon="❤️"
                    color="red"
                    href="/client-dashboard/favorites"
                />
                <StatCard
                    title="Reviews Given"
                    value={stats.reviewsGiven}
                    icon="⭐"
                    color="yellow"
                    href="/client-dashboard/reviews"
                />
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                    <Link
                        href="/client-dashboard/bookings"
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        View All
                    </Link>
                </div>

                {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="📅"
                        title="No upcoming appointments"
                        description="Book your first appointment with a barber to get started."
                        actionText="Find Barbers"
                        actionHref="/barbers"
                    />
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickAction
                    title="Book New Appointment"
                    description="Find and book with professional barbers"
                    href="/barbers"
                    icon="✂️"
                    buttonText="Find Barbers"
                />
                <QuickAction
                    title="Manage Appointments"
                    description="View, reschedule, or cancel your bookings"
                    href="/client-dashboard/bookings"
                    icon="📅"
                    buttonText="View Appointments"
                />
                <QuickAction
                    title="Write a Review"
                    description="Share your experience with barbers"
                    href="/client-dashboard/reviews"
                    icon="⭐"
                    buttonText="Write Review"
                />
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color, href }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600'
    }

    const content = (
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }

    return content
}

function AppointmentCard({ appointment }) {
    const barber = appointment.barbers
    const service = appointment.services

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
                    <p className="text-sm text-gray-500">${service?.price}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-medium text-gray-900">
                    {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">{appointment.appointment_time}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {appointment.status}
                </span>
            </div>
        </div>
    )
}

function EmptyState({ icon, title, description, actionText, actionHref }) {
    return (
        <div className="text-center py-8">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
            <Link
                href={actionHref}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
                {actionText}
            </Link>
        </div>
    )
}

function QuickAction({ title, description, href, icon, buttonText }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            <Link
                href={href}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
            >
                {buttonText}
            </Link>
        </div>
    )
}