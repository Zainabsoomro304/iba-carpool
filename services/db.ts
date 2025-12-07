import { User, Ride, RideRequest, RequestStatus } from '../types';

// API base URL - use relative path for both local dev and production
const API_BASE = '/api';

// Helper function to make API calls with better error handling
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  console.log(`[Frontend] Making API call to: ${url}`);
  console.log(`[Frontend] Method: ${options.method || 'GET'}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`[Frontend] Response status: ${response.status}`);
    console.log(`[Frontend] Response ok: ${response.ok}`);

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        console.error(`[Frontend] Error response text: ${text}`);
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error(`[Frontend] Error data:`, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log(`[Frontend] Success:`, json);
    return json;
  } catch (err: any) {
    console.error(`[Frontend] API call failed:`, err);
    console.error(`[Frontend] Error name:`, err.name);
    console.error(`[Frontend] Error message:`, err.message);
    
    // Provide more specific error messages
    if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
      throw new Error(`Network Error: Unable to connect to the API server. The endpoint "${url}" may not be deployed or accessible. Please check your deployment.`);
    }
    throw err;
  }
};

// --- User Services ---

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const result = await apiCall('/users?action=findByEmail', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return result.user || undefined;
};

export const findUserByERP = async (erp_id: string): Promise<User | undefined> => {
  const result = await apiCall('/users?action=findByERP', {
    method: 'POST',
    body: JSON.stringify({ erp_id }),
  });
  return result.user || undefined;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const result = await apiCall('/users?action=create', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return result.user;
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  await apiCall('/users?action=updatePassword', {
    method: 'POST',
    body: JSON.stringify({ userId, newPassword }),
  });
};

// --- Ride Services ---

export const createRide = async (rideData: Omit<Ride, 'id' | 'created_at' | 'available_seats'>): Promise<Ride> => {
  const result = await apiCall('/rides?action=create', {
    method: 'POST',
    body: JSON.stringify(rideData),
  });
  return result.ride;
};

export const getRides = async (): Promise<Ride[]> => {
  const result = await apiCall('/rides?action=getAll', {
    method: 'GET',
  });
  return result.rides || [];
};

export const getRidesByHost = async (hostId: string): Promise<Ride[]> => {
  const result = await apiCall(`/rides?action=getByHost&hostId=${encodeURIComponent(hostId)}`, {
    method: 'GET',
  });
  return result.rides || [];
};

// --- Request Services ---

export const createRideRequest = async (requestData: Omit<RideRequest, 'id' | 'created_at' | 'status'>): Promise<RideRequest> => {
  const result = await apiCall('/requests?action=create', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
  return result.request;
};

export const getRequestsForRide = async (rideId: string): Promise<RideRequest[]> => {
  const result = await apiCall(`/requests?action=getForRide&rideId=${encodeURIComponent(rideId)}`, {
    method: 'GET',
  });
  return result.requests || [];
};

export const getRequestsByPassenger = async (passengerId: string): Promise<{request: RideRequest, ride: Ride}[]> => {
  const result = await apiCall(`/requests?action=getByPassenger&passengerId=${encodeURIComponent(passengerId)}`, {
    method: 'GET',
  });
  return result.requests || [];
};

export const updateRequestStatus = async (requestId: string, status: RequestStatus): Promise<void> => {
  await apiCall('/requests?action=updateStatus', {
    method: 'POST',
    body: JSON.stringify({ requestId, status }),
  });
};
