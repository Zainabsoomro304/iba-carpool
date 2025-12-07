// Server-side database utilities for NeonDB
// This file runs on the server, so it can safely use the API key

const PROJECT_HOST = process.env.NEON_PROJECT_HOST || "ep-weathered-union-ahorbtng.c-3.us-east-1.aws.neon.tech";
const API_BASE = `https://${PROJECT_HOST}/sql`;
const API_TOKEN = process.env.NEON_API_TOKEN || "npg_Bis4u7lpYvNX";
const DB_NAME = process.env.NEON_DB_NAME || "neondb";

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`,
  };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic fetch wrapper to execute SQL with retry logic
export const executeSql = async (query: string, params: any[] = [], retries = 2): Promise<any[]> => {
  const url = `${API_BASE}?dbname=${DB_NAME}`;
  const headers = getHeaders();
  
  console.log(`[DB] Executing SQL: ${query.substring(0, 50)}...`);
  console.log(`[DB] URL: ${url}`);
  console.log(`[DB] Has token: ${!!API_TOKEN}`);
  
  try {
    const requestBody = JSON.stringify({ query, params });
    console.log(`[DB] Request body: ${requestBody.substring(0, 200)}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: requestBody,
    });

    console.log(`[DB] Response status: ${response.status}`);
    console.log(`[DB] Response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DB] Error response: ${errorText}`);
      
      // If 503 or 504, the DB might be waking up or timed out
      if ((response.status === 503 || response.status === 504) && retries > 0) {
        console.log(`[DB] Database might be sleeping (Status ${response.status}). Retrying in 2s...`);
        await delay(2000);
        return executeSql(query, params, retries - 1);
      }
      
      // More specific error messages
      if (response.status === 401) {
        throw new Error('Database authentication failed. Please check your API token.');
      }
      if (response.status === 404) {
        throw new Error('Database endpoint not found. Please check your project host.');
      }
      
      throw new Error(`Database Error (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    console.log(`[DB] Success: ${json.rows?.length || 0} rows returned`);
    // Neon /sql endpoint returns { rows: [...], fields: [...] }
    return json.rows || [];
  } catch (err: any) {
    console.error("[DB] SQL Execution Error:", err);
    console.error("[DB] Error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack?.substring(0, 500)
    });
    
    // Provide more helpful error messages
    if (err.message?.includes('fetch')) {
      throw new Error('Unable to connect to NeonDB. Please check your network connection and API credentials.');
    }
    throw err;
  }
};

