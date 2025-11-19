import { supabase } from '@/lib/supabase'

async function getBarbers() {
  console.log('Fetching barbers from Supabase...')
  
  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching barbers from Supabase:', error)
    return []
  }

  console.log('Barbers fetched from Supabase:', barbers)
  return barbers || []
}

export default async function BarbersPage() {
  const barbers = await getBarbers()

  // Calculate stats from ACTUAL Supabase data
  const totalBarbers = barbers.length
  const expertBarbers = barbers.filter(b => b.experience_years && b.experience_years >= 5).length
  const cities = [...new Set(barbers.map(b => b.city).filter(Boolean))]
  const specializations = [...new Set(barbers.map(b => b.specialization).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Professional Barbers</h1>
          <p className="text-lg text-gray-600">
            Showing {totalBarbers} barbers from our database
          </p>
        </div>

        {/* Stats Section - Only shows real Supabase data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalBarbers}</div>
            <div className="text-gray-600">Total Barbers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{expertBarbers}</div>
            <div className="text-gray-600">Expert Barbers (5+ years)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{cities.length}</div>
            <div className="text-gray-600">Cities Covered</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{specializations.length}</div>
            <div className="text-gray-600">Specializations</div>
          </div>
        </div>

        {barbers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Barbers in Database</h3>
              <p className="text-gray-600 mb-4">Your Supabase barbers table is empty.</p>
              <p className="text-sm text-gray-500">
                Barbers will appear here once they are added to your database.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((barber) => (
              <div key={barber.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                  
                  {barber.city && (
                    <p className="text-gray-500 text-sm mb-4">
                      📍 {barber.city}{barber.state ? `, ${barber.state}` : ''}
                    </p>
                  )}
                  
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
                      View Profile
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <details>
            <summary className="cursor-pointer font-medium">Database Info (Click to expand)</summary>
            <div className="mt-2 text-sm">
              <p><strong>Barbers in Database:</strong> {totalBarbers}</p>
              <p><strong>Cities:</strong> {cities.join(', ') || 'None'}</p>
              <p><strong>Specializations:</strong> {specializations.join(', ') || 'None'}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
