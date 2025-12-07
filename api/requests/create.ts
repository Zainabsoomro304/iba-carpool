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
    const requestData = req.body;
    
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
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

