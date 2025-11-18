// app/test/page.js
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
    const [status, setStatus] = useState('Testing...')

    useEffect(() => {
        async function test() {
            try {
                const { data, error } = await supabase.from('barbers').select('*').limit(1)
                if (error) {
                    setStatus(`Error: ${error.message}`)
                } else {
                    setStatus(`Success! Found ${data.length} barbers`)
                }
            } catch (err) {
                setStatus(`Exception: ${err.message}`)
            }
        }
        test()
    }, [])

    return (
        <div className="p-8">
            <h1>Supabase Connection Test</h1>
            <p>Status: {status}</p>
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Loaded' : 'Missing'}</p>
        </div>
    )
}