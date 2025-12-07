import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeSql } from './db-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;
    console.log('[API] Rides endpoint called, action:', action);

    // Parse body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('[API] Failed to parse body:', e);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    switch (action) {
      case 'create': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const rideData = body;
        
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
      }

      case 'getAll': {
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const rows = await executeSql('SELECT * FROM rides ORDER BY departure_time ASC');
        return res.status(200).json({ rides: rows });
      }

      case 'getByHost': {
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { hostId } = req.query;
        if (!hostId) {
          return res.status(400).json({ error: 'Host ID is required' });
        }
        const rows = await executeSql('SELECT * FROM rides WHERE host_id = $1 ORDER BY departure_time DESC', [hostId as string]);
        return res.status(200).json({ rides: rows });
      }

      default:
        return res.status(400).json({ error: 'Invalid action. Use: create, getAll, or getByHost' });
    }
  } catch (error: any) {
    console.error('[API] Error in rides endpoint:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

