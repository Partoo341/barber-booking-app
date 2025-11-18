// lib/test-supabase.js
import { supabase } from './supabase'

export async function testConnection() {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Loaded' : 'Missing')

    try {
        const { data, error } = await supabase
            .from('barbers')
            .select('count')
            .limit(1)

        if (error) {
            console.error('Connection Test Error:', error)
            return false
        }

        console.log('Connection successful!')
        return true
    } catch (err) {
        console.error('Connection Test Exception:', err)
        return false
    }
}