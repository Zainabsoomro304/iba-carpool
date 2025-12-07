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
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }
    await executeSql('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

