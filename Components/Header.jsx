'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        setIsMenuOpen(false)
    }

    return (
        <header className="bg-white shadow-sm border-b">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-blue-600">
                            BarberBook
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                Home
                            </Link>
                            {/* CHANGED: This now points to the new location search page */}
                            <Link href="/find-barbers" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                Find Barbers
                            </Link>
                            {/* Keep the original barbers page as "All Barbers" */}
                            <Link href="/barbers" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                All Barbers
                            </Link>
                            {user && (
                                <Link href="/dashboard" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-700">
                                        Hello, {user.email?.split('@')[0]}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Login
                                    </Link>
                                    <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-900 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                            <Link 
                                href="/" 
                                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            {/* CHANGED: Mobile menu also points to new location search */}
                            <Link 
                                href="/find-barbers" 
                                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Find Barbers
                            </Link>
                            {/* Keep the original barbers page in mobile menu too */}
                            <Link 
                                href="/barbers" 
                                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                All Barbers
                            </Link>
                            {user && (
                                <Link 
                                    href="/dashboard" 
                                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            )}

                            <div className="border-t pt-4">
                                {user ? (
                                    <div className="space-y-2">
                                        <div className="text-gray-900 block px-3 py-2 text-base font-medium">
                                            Hello, {user.email?.split('@')[0]}
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Link 
                                            href="/login" 
                                            className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link 
                                            href="/register" 
                                            className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium mt-2"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}
