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
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, params }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If 503 or 504, the DB might be waking up or timed out
      if ((response.status === 503 || response.status === 504) && retries > 0) {
        console.log(`Database might be sleeping (Status ${response.status}). Retrying in 2s...`);
        await delay(2000);
        return executeSql(query, params, retries - 1);
      }
      console.error(`DB Error [${response.status}]`, errorText);
      throw new Error(`Database Error (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    // Neon /sql endpoint returns { rows: [...], fields: [...] }
    return json.rows || [];
  } catch (err: any) {
    console.error("SQL Execution Error:", err);
    throw err;
  }
};

