// app/dashboard/profile/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        shop_name: '',
        bio: '',
        avatar_url: '',
        address: '',
        city: '',
        state: '',
        zip_code: ''
    })

    useEffect(() => {
        if (user) {
            fetchProfile()
        }
    }, [user])

    const fetchProfile = async () => {
        try {
            const { data: profileData, error } = await supabase
                .from('barbers')
                .select('*')
                .eq('auth_id', user.id)
                .single()

            if (error) throw error

            setProfile(profileData)
            setFormData({
                name: profileData.name || '',
                email: profileData.email || '',
                phone: profileData.phone || '',
                shop_name: profileData.shop_name || '',
                bio: profileData.bio || '',
                avatar_url: profileData.avatar_url || '',
                address: profileData.address || '',
                city: profileData.city || '',
                state: profileData.state || '',
                zip_code: profileData.zip_code || ''
            })

        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage('')

        try {
            const { error } = await supabase
                .from('barbers')
                .update(formData)
                .eq('auth_id', user.id)

            if (error) throw error

            setMessage('Profile updated successfully!')
            // Refresh profile data
            fetchProfile()

        } catch (error) {
            console.error('Error updating profile:', error)
            setMessage('Error updating profile. Please try again.')
        } finally {
            setIsSaving(false)
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
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">
                    Manage your barber profile and business information
                </p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.includes('Error')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                    {message}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Shop Name
                                </label>
                                <input
                                    type="text"
                                    name="shop_name"
                                    value={formData.shop_name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your barbershop name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell clients about your experience, specialties, and what makes your barbershop unique..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Photo URL
                                </label>
                                <input
                                    type="url"
                                    name="avatar_url"
                                    value={formData.avatar_url}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/your-photo.jpg"
                                />
                                {formData.avatar_url && (
                                    <div className="mt-2">
                                        <img
                                            src={formData.avatar_url}
                                            alt="Profile preview"
                                            className="w-20 h-20 rounded-full object-cover border"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Profile Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Preview</h2>
                <div className="border rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                        <img
                            src={formData.avatar_url || '/default-barber.jpg'}
                            alt="Profile preview"
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{formData.name}</h3>
                            <p className="text-gray-600">{formData.shop_name}</p>
                            {formData.city && formData.state && (
                                <p className="text-gray-500 text-sm mt-1">
                                    📍 {formData.city}, {formData.state}
                                </p>
                            )}
                            {formData.bio && (
                                <p className="text-gray-600 text-sm mt-2">{formData.bio}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}