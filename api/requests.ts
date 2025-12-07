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
    console.log('[API] Requests endpoint called, action:', action);

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
        const requestData = body;
        
        // Check existing
        const existing = await executeSql(
          "SELECT * FROM ride_requests WHERE ride_id = $1 AND passenger_id = $2 AND status IN ('pending', 'accepted')",
          [requestData.ride_id, requestData.passenger_id]
        );

        if (existing.length > 0) {
          return res.status(400).json({ error: 'You already have a pending or accepted request for this ride.' });
        }

        const query = `
          INSERT INTO ride_requests (
            ride_id, passenger_id, passenger_name, offered_price, comment, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending')
          RETURNING *
        `;

        const params = [
          requestData.ride_id,
          requestData.passenger_id,
          requestData.passenger_name,
          requestData.offered_price,
          requestData.comment
        ];

        const rows = await executeSql(query, params);
        return res.status(200).json({ request: rows[0] });
      }

      case 'getForRide': {
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { rideId } = req.query;
        if (!rideId) {
          return res.status(400).json({ error: 'Ride ID is required' });
        }
        const rows = await executeSql('SELECT * FROM ride_requests WHERE ride_id = $1', [rideId as string]);
        return res.status(200).json({ requests: rows });
      }

      case 'getByPassenger': {
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
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
      }

      case 'updateStatus': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { requestId, status } = body || {};
        if (!requestId || !status) {
          return res.status(400).json({ error: 'Request ID and status are required' });
        }

        // Get request details
        const reqRows = await executeSql('SELECT * FROM ride_requests WHERE id = $1', [requestId]);
        if (reqRows.length === 0) {
          return res.status(404).json({ error: 'Request not found' });
        }
        const request = reqRows[0];

        if (status === 'accepted') {
          const rideRows = await executeSql('SELECT * FROM rides WHERE id = $1', [request.ride_id]);
          if (rideRows.length === 0) {
            return res.status(404).json({ error: 'Ride not found' });
          }
          const ride = rideRows[0];

          if (ride.available_seats <= 0) {
            return res.status(400).json({ error: 'No seats available' });
          }

          // Update ride seats
          await executeSql('UPDATE rides SET available_seats = available_seats - 1 WHERE id = $1', [request.ride_id]);
        }

        // Update request status
        await executeSql('UPDATE ride_requests SET status = $1 WHERE id = $2', [status, requestId]);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Invalid action. Use: create, getForRide, getByPassenger, or updateStatus' });
    }
  } catch (error: any) {
    console.error('[API] Error in requests endpoint:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

