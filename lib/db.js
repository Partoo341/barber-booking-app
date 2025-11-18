// lib/db.js
import { sql } from '@vercel/postgres';

export async function getBookingsByClient(clientId) {
    try {
        const result = await sql`
      SELECT * FROM bookings 
      WHERE client_id = ${clientId}
    `;
        return result.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch bookings.');
    }
}