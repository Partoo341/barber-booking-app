// app/dashboard/calendar/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function CalendarPage() {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchAppointments()
        }
    }, [user, selectedDate])

    const fetchAppointments = async () => {
        try {
            const { data: barber, error: barberError } = await supabase
                .from('barbers')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (barberError) throw barberError

            const year = selectedDate.getFullYear()
            const month = selectedDate.getMonth() + 1

            const { data: appointmentsData, error } = await supabase
                .from('bookings')
                .select(`
          *,
          services (name)
        `)
                .eq('barber_id', barber.id)
                .gte('appointment_date', `${year}-${month.toString().padStart(2, '0')}-01`)
                .lt('appointment_date', `${year}-${month + 1}-01`)
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true })

            if (error) throw error
            setAppointments(appointmentsData || [])

        } catch (error) {
            console.error('Error fetching calendar appointments:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getAppointmentsForDate = (date) => {
        const dateString = date.toISOString().split('T')[0]
        return appointments.filter(apt => apt.appointment_date === dateString)
    }

    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate)
        newDate.setMonth(selectedDate.getMonth() + direction)
        setSelectedDate(newDate)
    }

    const generateCalendar = () => {
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        startDate.setDate(firstDay.getDate() - firstDay.getDay())

        const calendar = []
        const currentDate = new Date(startDate)

        for (let week = 0; week < 6; week++) {
            const weekDays = []
            for (let day = 0; day < 7; day++) {
                const date = new Date(currentDate)
                const appointmentsToday = getAppointmentsForDate(date)
                weekDays.push({
                    date: new Date(date),
                    isCurrentMonth: date.getMonth() === month,
                    appointments: appointmentsToday
                })
                currentDate.setDate(currentDate.getDate() + 1)
            }
            calendar.push(weekDays)
        }

        return calendar
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const calendar = generateCalendar()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        ←
                    </button>
                    <h2 className="text-xl font-semibold">
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h2>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                    {dayNames.map(day => (
                        <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                <div className="divide-y divide-gray-200">
                    {calendar.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-200">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={`p-2 min-h-24 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-sm font-medium ${day.date.toDateString() === new Date().toDateString()
                                                ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                                                : ''
                                            }`}>
                                            {day.date.getDate()}
                                        </span>
                                        {day.appointments.length > 0 && (
                                            <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
                                                {day.appointments.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {day.appointments.slice(0, 2).map((appointment, index) => (
                                            <div
                                                key={index}
                                                className="text-xs bg-blue-50 text-blue-700 p-1 rounded truncate"
                                                title={`${appointment.appointment_time} - ${appointment.client_name}`}
                                            >
                                                {appointment.appointment_time} - {appointment.client_name}
                                            </div>
                                        ))}
                                        {day.appointments.length > 2 && (
                                            <div className="text-xs text-gray-500">
                                                +{day.appointments.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Today's Appointments</h3>
                {getAppointmentsForDate(new Date()).length > 0 ? (
                    <div className="space-y-2">
                        {getAppointmentsForDate(new Date()).map(appointment => (
                            <div key={appointment.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-gray-900">{appointment.client_name}</div>
                                    <div className="text-sm text-gray-600">{appointment.services?.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-gray-900">{appointment.appointment_time}</div>
                                    <div className={`text-xs ${appointment.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                        {appointment.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No appointments scheduled for today.</p>
                )}
            </div>
        </div>
    )
}