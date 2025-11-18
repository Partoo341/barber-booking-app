// app/dashboard/appointments/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function AppointmentsPage() {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, upcoming, past

    useEffect(() => {
        if (user) {
            fetchAppointments()
        }
    }, [user, filter])

    const fetchAppointments = async () => {
        try {
            // Get barber profile
            const { data: barber, error: barberError } = await supabase
                .from('barbers')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (barberError) throw barberError

            // Get appointments with service information
            let query = supabase
                .from('bookings')
                .select(`
          *,
          services (name, price, duration_minutes)
        `)
                .eq('barber_id', barber.id)

            // Apply filters
            const today = new Date().toISOString().split('T')[0]
            if (filter === 'upcoming') {
                query = query.gte('appointment_date', today)
            } else if (filter === 'past') {
                query = query.lt('appointment_date', today)
            }

            const { data: appointmentsData, error } = await query.order('appointment_date', { ascending: true })

            if (error) throw error
            setAppointments(appointmentsData || [])

        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', appointmentId)

            if (error) throw error

            // Refresh appointments
            fetchAppointments()
        } catch (error) {
            console.error('Error updating appointment:', error)
            alert('Failed to update appointment status')
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
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <div className="flex space-x-2">
                    <FilterButton
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </FilterButton>
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
                </div>
            </div>

            {appointments.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client & Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map((appointment) => (
                                <AppointmentRow
                                    key={appointment.id}
                                    appointment={appointment}
                                    onStatusUpdate={updateAppointmentStatus}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-500 mb-6">
                        {filter === 'all'
                            ? "You don't have any appointments yet."
                            : `No ${filter} appointments found.`
                        }
                    </p>
                </div>
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

function AppointmentRow({ appointment, onStatusUpdate }) {
    const isPast = new Date(appointment.appointment_date) < new Date()

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {appointment.client_name}
                    </div>
                    <div className="text-sm text-gray-500">
                        {appointment.client_email} • {appointment.client_phone}
                    </div>
                    <div className="text-sm text-gray-500">
                        {appointment.services?.name} - ${appointment.services?.price}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {new Date(appointment.appointment_date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                    {appointment.appointment_time}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {appointment.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {!isPast && appointment.status === 'confirmed' && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onStatusUpdate(appointment.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                        >
                            Mark Complete
                        </button>
                        <button
                            onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                        >
                            Cancel
                        </button>
                    </div>
                )}
                {isPast && (
                    <span className="text-gray-400">Completed</span>
                )}
            </td>
        </tr>
    )
}