// app/dashboard/services/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function ServicesPage() {
    const { user } = useAuth()
    const [services, setServices] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_minutes: 30
    })

    useEffect(() => {
        if (user) {
            fetchServices()
        }
    }, [user])

    const fetchServices = async () => {
        try {
            const { data: barber, error: barberError } = await supabase
                .from('barbers')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (barberError) throw barberError

            const { data: servicesData, error } = await supabase
                .from('services')
                .select('*')
                .eq('barber_id', barber.id)
                .order('created_at', { ascending: true })

            if (error) throw error
            setServices(servicesData || [])

        } catch (error) {
            console.error('Error fetching services:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'duration_minutes' ? Number(value) : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const { data: barber, error: barberError } = await supabase
                .from('barbers')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (barberError) throw barberError

            if (editingService) {
                // Update existing service
                const { error } = await supabase
                    .from('services')
                    .update({
                        name: formData.name,
                        description: formData.description,
                        price: parseFloat(formData.price),
                        duration_minutes: parseInt(formData.duration_minutes)
                    })
                    .eq('id', editingService.id)

                if (error) throw error
            } else {
                // Create new service
                const { error } = await supabase
                    .from('services')
                    .insert([{
                        barber_id: barber.id,
                        name: formData.name,
                        description: formData.description,
                        price: parseFloat(formData.price),
                        duration_minutes: parseInt(formData.duration_minutes)
                    }])

                if (error) throw error
            }

            // Refresh services and reset form
            fetchServices()
            resetForm()
            setIsModalOpen(false)

        } catch (error) {
            console.error('Error saving service:', error)
            alert('Failed to save service. Please try again.')
        }
    }

    const handleEdit = (service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price,
            duration_minutes: service.duration_minutes
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (serviceId) => {
        if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            return
        }

        try {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', serviceId)

            if (error) throw error

            // Refresh services
            fetchServices()

        } catch (error) {
            console.error('Error deleting service:', error)
            alert('Failed to delete service. Please try again.')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration_minutes: 30
        })
        setEditingService(null)
    }

    const openModal = () => {
        resetForm()
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingService(null)
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Services & Pricing</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your services, prices, and durations
                    </p>
                </div>
                <button
                    onClick={openModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    + Add Service
                </button>
            </div>

            {/* Services Grid */}
            {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <EmptyServicesState onAddService={openModal} />
            )}

            {/* Add/Edit Service Modal */}
            {isModalOpen && (
                <ServiceModal
                    formData={formData}
                    editingService={editingService}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            )}
        </div>
    )
}

function ServiceCard({ service, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(service)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(service.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {service.description && (
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <span className="text-2xl font-bold text-gray-900">${service.price}</span>
                    <span className="text-gray-500 text-sm ml-1">per service</span>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-600">{service.duration_minutes} min</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    Created {new Date(service.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}

function EmptyServicesState({ onAddService }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">✂️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Add your first service to let clients know what you offer and how much it costs.
            </p>
            <button
                onClick={onAddService}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                Create Your First Service
            </button>
        </div>
    )
}

function ServiceModal({ formData, editingService, onInputChange, onSubmit, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Haircut, Beard Trim, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={onInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe what this service includes..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={onInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="25.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (minutes) *
                                </label>
                                <select
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={onInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                    <option value="90">90 minutes</option>
                                    <option value="120">120 minutes</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                {editingService ? 'Update Service' : 'Create Service'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}