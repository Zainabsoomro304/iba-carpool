import { User, Ride, RideRequest, RequestStatus } from '../types';

// API base URL - use relative path for both local dev and production
const API_BASE = '/api';

// Helper function to make API calls with better error handling
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    // Provide more specific error messages
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Network Error: Unable to connect to the server. Please check your connection and ensure the API is deployed correctly.');
    }
    throw err;
  }
};

// --- User Services ---

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const result = await apiCall('/users/findByEmail', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return result.user || undefined;
};

export const findUserByERP = async (erp_id: string): Promise<User | undefined> => {
  const result = await apiCall('/users/findByERP', {
    method: 'POST',
    body: JSON.stringify({ erp_id }),
  });
  return result.user || undefined;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const result = await apiCall('/users/create', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return result.user;
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  await apiCall('/users/updatePassword', {
    method: 'POST',
    body: JSON.stringify({ userId, newPassword }),
  });
};

// --- Ride Services ---

export const createRide = async (rideData: Omit<Ride, 'id' | 'created_at' | 'available_seats'>): Promise<Ride> => {
  const result = await apiCall('/rides/create', {
    method: 'POST',
    body: JSON.stringify(rideData),
  });
  return result.ride;
};

export const getRides = async (): Promise<Ride[]> => {
  const result = await apiCall('/rides/getAll', {
    method: 'GET',
  });
  return result.rides || [];
};

export const getRidesByHost = async (hostId: string): Promise<Ride[]> => {
  const result = await apiCall(`/rides/getByHost?hostId=${encodeURIComponent(hostId)}`, {
    method: 'GET',
  });
  return result.rides || [];
};

// --- Request Services ---

export const createRideRequest = async (requestData: Omit<RideRequest, 'id' | 'created_at' | 'status'>): Promise<RideRequest> => {
  const result = await apiCall('/requests/create', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
  return result.request;
};

export const getRequestsForRide = async (rideId: string): Promise<RideRequest[]> => {
  const result = await apiCall(`/requests/getForRide?rideId=${encodeURIComponent(rideId)}`, {
    method: 'GET',
  });
  return result.requests || [];
};

export const getRequestsByPassenger = async (passengerId: string): Promise<{request: RideRequest, ride: Ride}[]> => {
  const result = await apiCall(`/requests/getByPassenger?passengerId=${encodeURIComponent(passengerId)}`, {
    method: 'GET',
  });
  return result.requests || [];
};

export const updateRequestStatus = async (requestId: string, status: RequestStatus): Promise<void> => {
  await apiCall('/requests/updateStatus', {
    method: 'POST',
    body: JSON.stringify({ requestId, status }),
  });
};
