import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeSql } from '../db-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { passengerId } = req.query;
    if (!passengerId) {
      return res.status(400).json({ error: 'Passenger ID is required' });
    }
    
    // Join query to get ride details
    const query = `
      SELECT 
        rr.id as rr_id, rr.ride_id, rr.passenger_id, rr.passenger_name, rr.offered_price, rr.comment, rr.status, rr.created_at as rr_created_at,
        r.id as r_id, r.host_id, r.host_name, r.departure_location, r.destination_location, r.departure_time, r.fare, r.total_seats, r.available_seats, r.created_at as r_created_at
      FROM ride_requests rr
      JOIN rides r ON rr.ride_id = r.id
      WHERE rr.passenger_id = $1
      ORDER BY rr.created_at DESC
    `;

    const rows = await executeSql(query, [passengerId as string]);

    // Transform flat rows back to nested object structure
    const result = rows.map((row: any) => ({
      request: {
        id: row.rr_id,
        ride_id: row.ride_id,
        passenger_id: row.passenger_id,
        passenger_name: row.passenger_name,
        offered_price: row.offered_price,
        comment: row.comment,
        status: row.status,
        created_at: row.rr_created_at
      },
      ride: {
        id: row.r_id,
        host_id: row.host_id,
        host_name: row.host_name,
        departure_location: row.departure_location,
        destination_location: row.destination_location,
        departure_time: row.departure_time,
        fare: row.fare,
        total_seats: row.total_seats,
        available_seats: row.available_seats,
        created_at: row.r_created_at
      }
    }));

    return res.status(200).json({ requests: result });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

