import { User, Ride, RideRequest, RequestStatus } from '../types';

// Connection details derived from your provided string.
// We are using the standard regional endpoint format for the SQL-over-HTTP API.
// Original: ep-weathered-union-ahorbtng-pooler.c-3.us-east-1.aws.neon.tech
// HTTP Endpoint: ep-weathered-union-ahorbtng.us-east-1.aws.neon.tech
const PROJECT_HOST = "ep-weathered-union-ahorbtng.us-east-1.aws.neon.tech";
const API_BASE = `https://${PROJECT_HOST}/sql`;
const API_TOKEN = "npg_Bis4u7lpYvNX";
const DB_NAME = "neondb";

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`,
  };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic fetch wrapper to execute SQL with retry logic for "wake up" scenarios
const executeSql = async (query: string, params: any[] = [], retries = 2): Promise<any[]> => {
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
    if (err.message === 'Failed to fetch') {
      console.error("Network Error: Could not reach the Neon Database.");
      console.error("Debug Info: ", { url, mode: 'cors' });
      
      // If we have retries left, try one more time for network blips
      if (retries > 0) {
         await delay(1000);
         return executeSql(query, params, retries - 1);
      }
      
      throw new Error("Network Error: Unable to connect to the database. It might be blocked by your browser or network settings (CORS).");
    }
    console.error("SQL Execution Error:", err);
    throw err;
  }
};

// --- User Services ---

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const rows = await executeSql('SELECT * FROM users WHERE email = $1', [email]);
  return rows.length > 0 ? rows[0] : undefined;
};

export const findUserByERP = async (erp_id: string): Promise<User | undefined> => {
  const rows = await executeSql('SELECT * FROM users WHERE erp_id = $1', [erp_id]);
  return rows.length > 0 ? rows[0] : undefined;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  // Manual check to give good error messages
  const existingEmail = await findUserByEmail(userData.email);
  if (existingEmail) throw new Error('Email already exists');

  const existingErp = await findUserByERP(userData.erp_id);
  if (existingErp) throw new Error('ERP ID already exists');

  // We explicitly list columns to ensure safety
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
  return rows[0];
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  await executeSql('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
};

// --- Ride Services ---

export const createRide = async (rideData: Omit<Ride, 'id' | 'created_at' | 'available_seats'>): Promise<Ride> => {
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
  return rows[0];
};

export const getRides = async (): Promise<Ride[]> => {
  // Fetch rides and ensure dates are strings (Neon returns them as strings usually, but good to be safe)
  return executeSql('SELECT * FROM rides ORDER BY departure_time ASC');
};

export const getRidesByHost = async (hostId: string): Promise<Ride[]> => {
  return executeSql('SELECT * FROM rides WHERE host_id = $1 ORDER BY departure_time DESC', [hostId]);
};

// --- Request Services ---

export const createRideRequest = async (requestData: Omit<RideRequest, 'id' | 'created_at' | 'status'>): Promise<RideRequest> => {
  // Check existing
  const existing = await executeSql(
    "SELECT * FROM ride_requests WHERE ride_id = $1 AND passenger_id = $2 AND status IN ('pending', 'accepted')",
    [requestData.ride_id, requestData.passenger_id]
  );

  if (existing.length > 0) {
    throw new Error('You already have a pending or accepted request for this ride.');
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
  return rows[0];
};

export const getRequestsForRide = async (rideId: string): Promise<RideRequest[]> => {
  return executeSql('SELECT * FROM ride_requests WHERE ride_id = $1', [rideId]);
};

export const getRequestsByPassenger = async (passengerId: string): Promise<{request: RideRequest, ride: Ride}[]> => {
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

  const rows = await executeSql(query, [passengerId]);

  // Transform flat rows back to nested object structure
  return rows.map((row: any) => ({
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
};

export const updateRequestStatus = async (requestId: string, status: RequestStatus): Promise<void> => {
  // We need to do this in a transaction ideally, but for now strict sequential awaits
  const reqRows = await executeSql('SELECT * FROM ride_requests WHERE id = $1', [requestId]);
  if (reqRows.length === 0) throw new Error('Request not found');
  const request = reqRows[0];

  if (status === 'accepted') {
    const rideRows = await executeSql('SELECT * FROM rides WHERE id = $1', [request.ride_id]);
    if (rideRows.length === 0) throw new Error('Ride not found');
    const ride = rideRows[0];

    if (ride.available_seats <= 0) {
      throw new Error('No seats available');
    }

    // Update ride seats
    await executeSql('UPDATE rides SET available_seats = available_seats - 1 WHERE id = $1', [request.ride_id]);
  }

  // Update request status
  await executeSql('UPDATE ride_requests SET status = $1 WHERE id = $2', [status, requestId]);
};
