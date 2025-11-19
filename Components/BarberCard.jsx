'use client'
import Link from 'next/link'

export default function BarberCard({ barber }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {barber.profile_image ? (
          <img 
            src={barber.profile_image} 
            alt={barber.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-4xl">💈</div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{barber.name}</h3>
        
        {barber.specialization && (
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Specialty:</span> {barber.specialization}
          </p>
        )}
        
        {barber.experience_years && (
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Experience:</span> {barber.experience_years} years
          </p>
        )}
        
        {barber.hourly_rate && (
          <p className="text-gray-600 mb-4">
            <span className="font-medium">Rate:</span> KSH {barber.hourly_rate}/hour
          </p>
        )}
        
        {barber.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{barber.bio}</p>
        )}
        
        {barber.city && (
          <p className="text-gray-500 text-sm mb-4">
            📍 {barber.city}{barber.state ? `, ${barber.state}` : ''}
          </p>
        )}
        
        <div className="flex space-x-3">
          <Link 
            href={`/barbers/${barber.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            View Profile
          </Link>
          <Link 
            href={`/find-barbers?location=${barber.city}`}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm text-center"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  )
}
