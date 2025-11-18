// app/page.js
import BarberCard from '@/components/BarberCard'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getBarbers() {
    try {
        console.log('Fetching barbers...')

        const { data: barbers, error } = await supabase
            .from('barbers')
            .select('*')
            .limit(6)

        if (error) {
            console.error('Supabase Query Error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            })
            throw error
        }

        console.log('Barbers fetched successfully:', barbers?.length)
        return barbers || []
    } catch (error) {
        console.error('Error in getBarbers:', error)
        return []
    }
}

export default async function Home() {
    let barbers = []
    let error = null

    try {
        barbers = await getBarbers()
    } catch (err) {
        error = err.message
        console.error('Home page error:', err)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-blue-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Find Your Perfect Barber
                    </h1>
                    <p className="text-xl mb-8">
                        Book appointments with the best barbers in your city
                    </p>

                    {/* Location Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <div className="flex-1 max-w-md">
                                <div className="flex rounded-lg overflow-hidden shadow-lg">
                                    <input
                                        type="text"
                                        placeholder="Enter your city or zip code..."
                                        className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
                                    />
                                    <Link
                                        href="/barbers"
                                        className="bg-white text-blue-600 px-6 py-3 font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                                    >
                                        Search Barbers
                                    </Link>
                                </div>
                            </div>
                            <Link
                                href="/barbers"
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
                            >
                                📍 Use My Location
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">{barbers.length}+</div>
                            <div className="text-blue-200">Professional Barbers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">100%</div>
                            <div className="text-blue-200">Verified Professionals</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">24/7</div>
                            <div className="text-blue-200">Online Booking</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        How BarberBook Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🔍</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Find Barbers</h3>
                            <p className="text-gray-600">
                                Search for barbers in your area by location, services, or ratings
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📅</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Book Instantly</h3>
                            <p className="text-gray-600">
                                Choose your preferred time slot and book appointments online
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✂️</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Get Groomed</h3>
                            <p className="text-gray-600">
                                Show up for your appointment and get the perfect haircut
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Error Display */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong>Database Error:</strong> {error}
                        <p className="mt-2 text-sm">
                            Please check your Supabase connection and environment variables.
                        </p>
                    </div>
                </div>
            )}

            {/* Featured Barbers Section */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Barbers</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover top-rated barbers in our community. Each professional brings unique skills and styles to give you the perfect look.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barbers.map((barber) => (
                        <BarberCard key={barber.id} barber={barber} />
                    ))}

                    {barbers.length === 0 && !error && (
                        <div className="col-span-3 text-center py-12">
                            <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                                <p className="text-gray-500 text-lg mb-4">No barbers found yet.</p>
                                <p className="text-gray-400 text-sm mb-6">
                                    Be the first barber in your area to join BarberBook and start accepting bookings!
                                </p>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                                >
                                    Register as Barber
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {barbers.length > 0 && (
                    <div className="text-center mt-12">
                        <Link
                            href="/barbers"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-block"
                        >
                            View All Barbers
                        </Link>
                    </div>
                )}
            </section>

            {/* CTA Section for Barbers */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Are You a Barber?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Join BarberBook today and grow your business. Reach new clients, manage appointments, and build your brand.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Register Your Shop
                        </Link>
                        <Link
                            href="/barber-login"
                            className="bg-transparent border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-gray-900 transition-colors font-semibold"
                        >
                            Barber Login
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}