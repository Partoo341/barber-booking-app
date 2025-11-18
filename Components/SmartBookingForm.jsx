// components/SmartBookingForm.jsx
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SmartBookingForm({ barber, services }) {
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        service_id: '',
        appointment_date: '',
        appointment_time: ''
    })
    const [availableSlots, setAvailableSlots] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

    useEffect(() => {
        if (formData.appointment_date && formData.service_id) {
            checkAvailability()
        }
    }, [formData.appointment_date, formData.service_id])

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const checkAvailability = async () => {
        if (!formData.appointment_date || !formData.service_id) return

        setIsCheckingAvailability(true)

        try {
            // Get selected service duration
            const selectedService = services.find(s => s.id === formData.service_id)
            if (!selectedService) return

            // Get barber's working hours
            const { data: barberData, error: barberError } = await supabase
                .from('barbers')
                .select('working_hours')
                .eq('id', barber.id)
                .single()

            if (barberError) throw barberError

            // Get existing appointments for the selected date
            const { data: existingAppointments, error: appointmentsError } = await supabase
                .from('bookings')
                .select('appointment_time, services(duration_minutes)')
                .eq('barber_id', barber.id)
                .eq('appointment_date', formData.appointment_date)
                .eq('status', 'confirmed')

            if (appointmentsError) throw appointmentsError

            // Generate available time slots
            const slots = generateTimeSlots(
                barberData.working_hours,
                formData.appointment_date,
                selectedService.duration_minutes,
                existingAppointments || []
            )

            setAvailableSlots(slots)

        } catch (error) {
            console.error('Error checking availability:', error)
            setMessage('Error checking availability. Please try again.')
        } finally {
            setIsCheckingAvailability(false)
        }
    }

    const generateTimeSlots = (workingHours, date, duration, existingAppointments) => {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        const daySchedule = workingHours[dayName]

        if (!daySchedule || !daySchedule.enabled) {
            return []
        }

        const slots = []
        const [startHour, startMinute] = daySchedule.start.split(':').map(Number)
        const [endHour, endMinute] = daySchedule.end.split(':').map(Number)

        let currentTime = new Date(date)
        currentTime.setHours(startHour, startMinute, 0, 0)

        const endTime = new Date(date)
        endTime.setHours(endHour, endMinute, 0, 0)

        while (currentTime < endTime) {
            const slotEnd = new Date(currentTime.getTime() + duration * 60000)

            if (slotEnd <= endTime) {
                const timeString = currentTime.toTimeString().slice(0, 5)

                // Check if slot is available (no overlapping appointments)
                const isAvailable = !existingAppointments.some(apt => {
                    const aptStart = new Date(`${date}T${apt.appointment_time}`)
                    const aptEnd = new Date(aptStart.getTime() + apt.services.duration_minutes * 60000)
                    return currentTime < aptEnd && slotEnd > aptStart
                })

                if (isAvailable) {
                    slots.push(timeString)
                }
            }

            // Move to next slot (30-minute intervals)
            currentTime.setMinutes(currentTime.getMinutes() + 30)
        }

        return slots
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage('')

        try {
            const { data, error } = await supabase
                .from('bookings')
                .insert([{
                    ...formData,
                    barber_id: barber.id,
                    status: 'confirmed'
                }])
                .select()

            if (error) throw error

            // Log booking confirmation (email functionality can be added later)
            console.log('Booking confirmed:', {
                bookingId: data[0].id,
                client: formData.client_name,
                email: formData.client_email,
                service: services.find(s => s.id === formData.service_id)?.name,
                date: formData.appointment_date,
                time: formData.appointment_time
            })

            setMessage('Booking confirmed! You will receive a confirmation shortly.')

            // Reset form
            setFormData({
                client_name: '',
                client_email: '',
                client_phone: '',
                service_id: '',
                appointment_date: '',
                appointment_time: ''
            })
            setAvailableSlots([])

        } catch (error) {
            console.error('Booking error:', error)
            setMessage('Error: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const getDayName = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h2>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.includes('Error')
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                    <div className="flex items-center">
                        {message.includes('Error') ? (
                            <span className="text-red-500 mr-2">⚠️</span>
                        ) : (
                            <span className="text-green-500 mr-2">✅</span>
                        )}
                        <span>{message}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                    </label>
                    <input
                        type="text"
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                    </label>
                    <input
                        type="email"
                        name="client_email"
                        value={formData.client_email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        type="tel"
                        name="client_phone"
                        value={formData.client_phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service *
                    </label>
                    <select
                        name="service_id"
                        value={formData.service_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>
                                {service.name} - ${service.price} ({service.duration_minutes}min)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                    </label>
                    <input
                        type="date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Available Time Slots */}
                {formData.appointment_date && formData.service_id && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Available Times on {getDayName(formData.appointment_date)}
                        </label>

                        {isCheckingAvailability ? (
                            <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Checking availability...</p>
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, appointment_time: slot }))}
                                        className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${formData.appointment_time === slot
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <span className="text-gray-400 text-2xl mb-2 block">⏰</span>
                                <p className="text-gray-500 text-sm">
                                    No available slots for this date.
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Please choose another date or contact the barber.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {formData.appointment_time && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center">
                            <span className="text-blue-500 mr-2">📅</span>
                            <div>
                                <p className="text-sm text-blue-800 font-medium">
                                    Appointment Selected
                                </p>
                                <p className="text-xs text-blue-600">
                                    {getDayName(formData.appointment_date)} at {formData.appointment_time}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !formData.appointment_time}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:shadow-none"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing Booking...
                        </div>
                    ) : (
                        'Confirm Booking'
                    )}
                </button>

                {/* Privacy Notice */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Your information is secure and will only be used for this booking.
                    </p>
                </div>
            </form>
        </div>
    )
}