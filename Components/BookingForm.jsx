// components/BookingForm.jsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function BookingForm({ barber, services }) {
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        service_id: '',
        appointment_date: '',
        appointment_time: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
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

            setMessage('Booking confirmed! We look forward to seeing you.')
            setFormData({
                client_name: '',
                client_email: '',
                client_phone: '',
                service_id: '',
                appointment_date: '',
                appointment_time: ''
            })
        } catch (error) {
            setMessage('Error: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Generate time slots (9 AM to 6 PM)
    const timeSlots = []
    for (let hour = 9; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            timeSlots.push(timeString)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h2>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {message}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>
                                {service.name} - ${service.price}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time *
                    </label>
                    <select
                        name="appointment_time"
                        value={formData.appointment_time}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a time</option>
                        {timeSlots.map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-semibold"
                >
                    {isLoading ? 'Booking...' : 'Book Appointment'}
                </button>
            </form>
        </div>
    )
}