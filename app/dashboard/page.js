// app/dashboard/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalAppointments: 0,
        todayAppointments: 0,
        monthlyRevenue: 0,
        activeServices: 0
    })
    const [recentAppointments, setRecentAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        try {
            // Get barber profile
            const { data: barber, error: barberError } = await supabase
                .from('barbers')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (barberError) throw barberError

            // Get appointments stats
            const { data: appointments, error: appointmentsError } = await supabase
                .from('bookings')
                .select('*')
                .eq('barber_id', barber.id)

            if (appointmentsError) throw appointmentsError

            // Get services count
            const { data: services, error: servicesError } = await supabase
                .from('services')
                .select('id')
                .eq('barber_id', barber.id)

            if (servicesError) throw servicesError

            // Calculate stats
            const today = new Date().toISOString().split('T')[0]
            const todayApps = appointments.filter(apt =>
                apt.appointment_date === today
            )

            // Calculate revenue (simplified - in real app, you'd sum actual payments)
            const monthlyRevenue = appointments.length * 25 // Placeholder calculation

            setStats({
                totalAppointments: appointments.length,
                todayAppointments: todayApps.length,
                monthlyRevenue,
                activeServices: services.length
            })

            // Get recent appointments
            const recent = appointments
                .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
                .slice(0, 5)

            setRecentAppointments(recent)

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
                    Here's what's happening with your barber business today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Appointments"
                    value={stats.todayAppointments}
                    icon="📅"
                    color="blue"
                />
                <StatCard
                    title="Total Appointments"
                    value={stats.totalAppointments}
                    icon="📊"
                    color="green"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`$${stats.monthlyRevenue}`}
                    icon="💰"
                    color="purple"
                />
                <StatCard
                    title="Active Services"
                    value={stats.activeServices}
                    icon="✂️"
                    color="orange"
                />
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
                    <Link
                        href="/dashboard/appointments"
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        View All
                    </Link>
                </div>

                {recentAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {recentAppointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-900">{appointment.client_name}</h3>
                                    <p className="text-sm text-gray-500">{appointment.client_email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        {new Date(appointment.appointment_date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">{appointment.appointment_time}</p>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'confirmed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {appointment.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No appointments yet</p>
                        <Link
                            href="/dashboard/profile"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Complete Your Profile
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickAction
                    title="Manage Services"
                    description="Add or edit your services and pricing"
                    href="/dashboard/services"
                    icon="✂️"
                />
                <QuickAction
                    title="View Calendar"
                    description="See your upcoming appointments"
                    href="/dashboard/calendar"
                    icon="🗓️"
                />
                <QuickAction
                    title="Edit Profile"
                    description="Update your business information"
                    href="/dashboard/profile"
                    icon="👤"
                />
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
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
}

function QuickAction({ title, description, href, icon }) {
    return (
        <Link
            href={href}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow block"
        >
            <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
        </Link>
    )
}