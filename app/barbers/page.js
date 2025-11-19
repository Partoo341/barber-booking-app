import { supabase } from '@/lib/supabase'
import BarberCard from '../../Components/BarberCard'

async function getBarbers() {
  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching barbers:', error)
    return []
  }

  return barbers || []
}

export default async function BarbersPage() {
  const barbers = await getBarbers()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Professional Barbers</h1>
          <p className="text-lg text-gray-600">Meet our skilled barbers from across Kenya</p>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-xl font-bold text-blue-600">{barbers.length}</div>
            <div className="text-gray-600 text-sm">Total Barbers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-xl font-bold text-green-600">
              {barbers.filter(b => b.experience_years >= 5).length}
            </div>
            <div className="text-gray-600 text-sm">Expert Barbers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-xl font-bold text-purple-600">
              {[...new Set(barbers.map(b => b.city).filter(Boolean))].length}
            </div>
            <div className="text-gray-600 text-sm">Cities</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-xl font-bold text-orange-600">
              {[...new Set(barbers.map(b => b.specialization).filter(Boolean))].length}
            </div>
            <div className="text-gray-600 text-sm">Specialties</div>
          </div>
        </div>

        {barbers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Barbers Available</h3>
              <p className="text-gray-600">We&apos;re working on adding more barbers to our platform.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((barber) => (
              <BarberCard key={barber.id} barber={barber} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
