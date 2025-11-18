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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Professional Barbers</h1>
          <p className="text-lg text-gray-600 mb-8">Book an appointment with our skilled barbers</p>
        </div>

        {barbers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Barbers Available</h3>
              <p className="text-gray-600">Check back later for available barbers.</p>
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
