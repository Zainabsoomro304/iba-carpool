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

    switch (action) {
      case 'findByEmail': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }
        const rows = await executeSql('SELECT * FROM users WHERE email = $1', [email]);
        return res.status(200).json({ user: rows.length > 0 ? rows[0] : null });
      }

      case 'findByERP': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { erp_id } = req.body;
        if (!erp_id) {
          return res.status(400).json({ error: 'ERP ID is required' });
        }
        const rows = await executeSql('SELECT * FROM users WHERE erp_id = $1', [erp_id]);
        return res.status(200).json({ user: rows.length > 0 ? rows[0] : null });
      }

      case 'create': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const userData = req.body;
        
        // Check for existing email
        const existingEmail = await executeSql('SELECT * FROM users WHERE email = $1', [userData.email]);
        if (existingEmail.length > 0) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        // Check for existing ERP ID
        const existingErp = await executeSql('SELECT * FROM users WHERE erp_id = $1', [userData.erp_id]);
        if (existingErp.length > 0) {
          return res.status(400).json({ error: 'ERP ID already exists' });
        }

        const query = `
          INSERT INTO users (
            erp_id, email, password, name, gender, graduating_year, 
            contact_number, role, sec_question_1, sec_answer_1, sec_question_2, sec_answer_2
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `;
        
        const params = [
          userData.erp_id,
          userData.email,
          userData.password,
          userData.name,
          userData.gender,
          userData.graduating_year,
          userData.contact_number,
          userData.role,
          userData.sec_question_1,
          userData.sec_answer_1,
          userData.sec_question_2,
          userData.sec_answer_2
        ];

        const rows = await executeSql(query, params);
        return res.status(200).json({ user: rows[0] });
      }

      case 'updatePassword': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
          return res.status(400).json({ error: 'User ID and new password are required' });
        }
        await executeSql('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

