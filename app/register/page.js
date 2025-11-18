// app/register/page.js
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Register() {
    const [userType, setUserType] = useState('barber') // 'client' or 'barber'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        shop_name: '',
        bio: '',
        avatar_url: '',
        address: '',
        city: '',
        state: '',
        zip_code: ''
    })
    const [services, setServices] = useState([{ name: '', price: '', duration: 30 }])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const { signUp } = useAuth()
    const router = useRouter()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('') // Clear errors when user types
    }

    const handleServiceChange = (index, field, value) => {
        const updatedServices = services.map((service, i) =>
            i === index ? { ...service, [field]: value } : service
        )
        setServices(updatedServices)
    }

    const addService = () => {
        setServices([...services, { name: '', price: '', duration: 30 }])
    }

    const removeService = (index) => {
        setServices(services.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setMessage('')

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long')
            setIsLoading(false)
            return
        }

        try {
            // Step 1: Create auth user
            const { data: authData, error: authError } = await signUp(
                formData.email,
                formData.password,
                {
                    name: formData.name,
                    user_type: userType
                }
            )

            if (authError) throw authError

            if (userType === 'barber') {
                // Create barber profile using database function
                const { data: barberId, error: barberError } = await supabase
                    .rpc('create_barber_profile', {
                        barber_auth_id: authData.user.id,
                        barber_name: formData.name,
                        barber_email: formData.email,
                        barber_phone: formData.phone || null,
                        barber_shop_name: formData.shop_name || null,
                        barber_bio: formData.bio || null,
                        barber_avatar_url: formData.avatar_url || null,
                        barber_address: formData.address || null,
                        barber_city: formData.city || null,
                        barber_state: formData.state || null,
                        barber_zip_code: formData.zip_code || null
                    })

                if (barberError) throw barberError

                // Insert services
                const validServices = services.filter(service =>
                    service.name && service.price && service.duration
                )

                if (validServices.length > 0) {
                    // We need to get the barber ID to insert services
                    const { data: barber, error: barberLookupError } = await supabase
                        .from('barbers')
                        .select('id')
                        .eq('auth_id', authData.user.id)
                        .single()

                    if (barberLookupError) throw barberLookupError

                    const servicesWithBarberId = validServices.map(service => ({
                        name: service.name,
                        price: parseFloat(service.price) || 0,
                        duration_minutes: parseInt(service.duration) || 30,
                        barber_id: barber.id
                    }))

                    const { error: servicesError } = await supabase
                        .from('services')
                        .insert(servicesWithBarberId)

                    if (servicesError) throw servicesError
                }

                setMessage('Barber registration successful! Your profile is now live.')
            } else {
                // Create client profile using database function
                const { error: clientError } = await supabase
                    .rpc('create_client_profile', {
                        client_auth_id: authData.user.id,
                        client_name: formData.name,
                        client_email: formData.email,
                        client_phone: formData.phone || null
                    })

                if (clientError) throw clientError

                setMessage('Client registration successful! You can now book appointments.')
            }

            // Auto-login after successful registration
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            })

            if (signInError) throw signInError

            // Success - AuthContext will handle redirect to dashboard
            setMessage('Registration successful! Redirecting...')

        } catch (error) {
            console.error('Registration error:', error)
            setError('Error: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Join BarberBook
                        </h1>
                        <p className="text-gray-600">
                            Create your account to {userType === 'barber' ? 'start accepting bookings' : 'book appointments'}
                        </p>
                    </div>

                    {/* User Type Selector */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 rounded-lg p-1 flex">
                            <button
                                type="button"
                                onClick={() => setUserType('client')}
                                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${userType === 'client'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                I'm a Client
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType('barber')}
                                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${userType === 'barber'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                I'm a Barber
                            </button>
                        </div>
                    </div>

                    {userType === 'barber' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-blue-600">💈</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-blue-800 text-sm">
                                        Register as a professional barber to start accepting bookings and growing your business.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        {/* Password Section - For Both */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Account Security</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="At least 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Repeat your password"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Business Information - Only for barbers */}
                        {userType === 'barber' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Business Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Shop Name
                                        </label>
                                        <input
                                            type="text"
                                            name="shop_name"
                                            value={formData.shop_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Elite Barbershop"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tell clients about your experience and specialties..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Profile Photo URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            name="avatar_url"
                                            value={formData.avatar_url}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com/your-photo.jpg"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Location Information - Only for barbers */}
                        {userType === 'barber' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Location Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="123 Main St"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="New York"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="NY"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ZIP Code
                                        </label>
                                        <input
                                            type="text"
                                            name="zip_code"
                                            value={formData.zip_code}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="10001"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Services - Only for barbers */}
                        {userType === 'barber' && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Services & Pricing</h2>
                                    <button
                                        type="button"
                                        onClick={addService}
                                        className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                                    >
                                        Add Service
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {services.map((service, index) => (
                                        <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg bg-gray-50">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Service Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={service.name}
                                                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Haircut, Shave, etc."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Price ($) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={service.price}
                                                        onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="25.00"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Duration (min) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="5"
                                                        value={service.duration}
                                                        onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            {services.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeService(index)}
                                                    className="text-red-600 hover:text-red-800 mt-8"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-semibold"
                            >
                                {isLoading ? 'Creating Account...' : `Sign up as ${userType === 'barber' ? 'Barber' : 'Client'}`}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}