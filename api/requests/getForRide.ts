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
    const { rideId } = req.query;
    if (!rideId) {
      return res.status(400).json({ error: 'Ride ID is required' });
    }
    const rows = await executeSql('SELECT * FROM ride_requests WHERE ride_id = $1', [rideId as string]);
    return res.status(200).json({ requests: rows });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

