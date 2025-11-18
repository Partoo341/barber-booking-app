// app/client-dashboard/profile/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function ClientProfilePage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    })

    useEffect(() => {
        if (user) {
            fetchProfile()
        }
    }, [user])

    const fetchProfile = async () => {
        try {
            const { data: profileData, error } = await supabase
                .from('clients')
                .select('*')
                .eq('auth_id', user.id)
                .single()

            if (error) throw error

            setProfile(profileData)
            setFormData({
                name: profileData.name || '',
                email: profileData.email || '',
                phone: profileData.phone || ''
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
                .from('clients')
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
                    Manage your personal information and preferences
                </p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.includes('Error')
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                    {message}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Your full name"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="your.email@example.com"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-gray-700">Account Created</p>
                                    <p className="text-gray-600">
                                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">Member Since</p>
                                    <p className="text-gray-600">
                                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        }) : 'N/A'}
                                    </p>
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
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xl">
                                {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{formData.name || 'Your Name'}</h3>
                            <p className="text-gray-600">{formData.email}</p>
                            {formData.phone && (
                                <p className="text-gray-500 text-sm mt-1">{formData.phone}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}