'use client'
import Link from 'next/link'

export default function BarberCard({ barber }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {barber.profile_image ? (
          <img src={barber.profile_image} alt={barber.name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-gray-400 text-4xl">💈</div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{barber.name}</h3>
        {barber.specialization && <p className="text-gray-600 mb-2">{barber.specialization}</p>}
        {barber.experience_years && <p className="text-gray-600 mb-2">{barber.experience_years} years experience</p>}
        {barber.hourly_rate && <p className="text-gray-600 mb-4">${barber.hourly_rate}/hour</p>}
        <Link href={`/barbers/${barber.id}`} className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700">
          View Profile
        </Link>
      </div>
    </div>
  )
}
