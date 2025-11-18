// app/client-dashboard/bookings/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function ClientBookingsPage() {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState('upcoming') // upcoming, past, all

    useEffect(() => {
        if (user) {
            fetchAppointments()
        }
    }, [user, filter])

    const fetchAppointments = async () => {
        try {
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (clientError) throw clientError

            let query = supabase
                .from('bookings')
                .select(`
          *,
          barbers (name, shop_name, avatar_url, phone, email),
          services (name, price, duration_minutes)
        `)
                .eq('client_id', client.id)

            const today = new Date().toISOString().split('T')[0]
            if (filter === 'upcoming') {
                query = query.gte('appointment_date', today)
            } else if (filter === 'past') {
                query = query.lt('appointment_date', today)
            }

            const { data: appointmentsData, error } = await query
                .order('appointment_date', { ascending: filter === 'upcoming' })
                .order('appointment_time', { ascending: true })

            if (error) throw error
            setAppointments(appointmentsData || [])

        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return
        }

        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', appointmentId)

            if (error) throw error

            // Refresh appointments
            fetchAppointments()
        } catch (error) {
            console.error('Error cancelling appointment:', error)
            alert('Failed to cancel appointment. Please try again.')
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your upcoming and past appointments
                    </p>
                </div>
                <div className="flex space-x-2">
                    <FilterButton
                        active={filter === 'upcoming'}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </FilterButton>
                    <FilterButton
                        active={filter === 'past'}
                        onClick={() => setFilter('past')}
                    >
                        Past
                    </FilterButton>
                    <FilterButton
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </FilterButton>
                </div>
            </div>

            {appointments.length > 0 ? (
                <div className="space-y-4">
                    {appointments.map((appointment) => (
                        <AppointmentDetailCard
                            key={appointment.id}
                            appointment={appointment}
                            onCancel={cancelAppointment}
                            showActions={filter === 'upcoming'}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="📅"
                    title={`No ${filter} appointments`}
                    description={
                        filter === 'upcoming'
                            ? "You don't have any upcoming appointments. Book with a barber to get started!"
                            : "You haven't had any appointments yet."
                    }
                    actionText={filter === 'upcoming' ? "Find Barbers" : "View Upcoming"}
                    actionHref={filter === 'upcoming' ? "/barbers" : "/client-dashboard/bookings?filter=upcoming"}
                />
            )}
        </div>
    )
}

function FilterButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
        >
            {children}
        </button>
    )
}

function AppointmentDetailCard({ appointment, onCancel, showActions }) {
    const barber = appointment.barbers
    const service = appointment.services
    const isPast = new Date(appointment.appointment_date) < new Date()

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-start space-x-4">
                        <img
                            src={barber?.avatar_url || '/default-barber.jpg'}
                            alt={barber?.name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{barber?.name}</h3>
                            <p className="text-gray-600">{barber?.shop_name}</p>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Service</p>
                                    <p className="text-gray-600">{service?.name}</p>
                                    <p className="text-gray-500 text-sm">${service?.price} • {service?.duration_minutes}min</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-900">Date & Time</p>
                                    <p className="text-gray-600">
                                        {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-gray-500 text-sm">{appointment.appointment_time}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-900">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'confirmed'
                                            ? 'bg-green-100 text-green-800'
                                            : appointment.status === 'cancelled'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {appointment.status}
                                    </span>
                                </div>

                                {(barber?.phone || barber?.email) && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Contact</p>
                                        {barber?.phone && <p className="text-gray-600 text-sm">{barber.phone}</p>}
                                        {barber?.email && <p className="text-gray-600 text-sm">{barber.email}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showActions && appointment.status === 'confirmed' && (
                    <div className="mt-4 md:mt-0 md:ml-6 flex space-x-2">
                        <button
                            onClick={() => onCancel(appointment.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {!isPast && appointment.status === 'confirmed' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        💡 Need to reschedule? Contact the barber directly to arrange a new time.
                    </p>
                </div>
            )}
        </div>
    )
}

function EmptyState({ icon, title, description, actionText, actionHref }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
            <a
                href={actionHref}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
                {actionText}
            </a>
        </div>
    )
}