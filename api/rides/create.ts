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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rideData = req.body;
    
    const query = `
      INSERT INTO rides (
        host_id, host_name, departure_location, destination_location, 
        departure_time, fare, total_seats, available_seats
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const params = [
      rideData.host_id,
      rideData.host_name,
      rideData.departure_location,
      rideData.destination_location,
      rideData.departure_time,
      rideData.fare,
      rideData.total_seats,
      rideData.total_seats // available_seats starts equal to total
    ];

    const rows = await executeSql(query, params);
    return res.status(200).json({ ride: rows[0] });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

