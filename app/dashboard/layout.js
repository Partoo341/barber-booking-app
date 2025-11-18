// app/dashboard/layout.js
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [barber, setBarber] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchBarberProfile = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('barbers')
                        .select('*')
                        .eq('auth_id', user.id)
                        .single()

                    if (error) throw error
                    setBarber(data)
                } catch (error) {
                    console.error('Error fetching barber profile:', error)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchBarberProfile()
    }, [user])

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dashboard Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold text-blue-600">
                                BarberBook
                            </Link>
                            <span className="mx-3 text-gray-300">/</span>
                            <span className="text-gray-700">Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Welcome, {barber?.name || user.email}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="md:w-64 flex-shrink-0">
                        <nav className="bg-white rounded-lg shadow-sm p-6 space-y-2">
                            <DashboardNavLink href="/dashboard">
                                📊 Overview
                            </DashboardNavLink>
                            <DashboardNavLink href="/dashboard/appointments">
                                📅 Appointments
                            </DashboardNavLink>
                            <DashboardNavLink href="/dashboard/calendar">
                                🗓️ Calendar
                            </DashboardNavLink>
                            <DashboardNavLink href="/dashboard/services">
                                ✂️ Services
                            </DashboardNavLink>
                            <DashboardNavLink href="/dashboard/profile">
                                👤 Profile
                            </DashboardNavLink>
                            <DashboardNavLink href="/dashboard/settings">
                                ⚙️ Settings
                            </DashboardNavLink>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

function DashboardNavLink({ href, children }) {
    return (
        <Link
            href={href}
            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
        >
            {children}
        </Link>
    )
}