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
    const { requestId, status } = req.body;
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
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

