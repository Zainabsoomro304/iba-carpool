import { User, Ride, RideRequest, RequestStatus } from '../types';

// Keys for localStorage
const USERS_KEY = 'carpool_users';
const RIDES_KEY = 'carpool_rides';
const REQUESTS_KEY = 'carpool_requests';

// Simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Initialization ---
const initializeDB = () => {
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify([]));
  if (!localStorage.getItem(RIDES_KEY)) localStorage.setItem(RIDES_KEY, JSON.stringify([]));
  if (!localStorage.getItem(REQUESTS_KEY)) localStorage.setItem(REQUESTS_KEY, JSON.stringify([]));
};

initializeDB();

// --- User Services ---

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  await delay(300);
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  return users.find(u => u.email === email);
};

export const findUserByERP = async (erp_id: string): Promise<User | undefined> => {
  await delay(300);
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  return users.find(u => u.erp_id === erp_id);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  await delay(500);
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find(u => u.erp_id === userData.erp_id)) {
    throw new Error('ERP ID already exists');
  }
  if (users.find(u => u.email === userData.email)) {
    throw new Error('Email already exists');
  }

  const newUser: User = { ...userData, id: Math.random().toString(36).substr(2, 9) };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  await delay(400);
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } else {
    throw new Error('User not found');
  }
};

// --- Ride Services ---

export const createRide = async (rideData: Omit<Ride, 'id' | 'created_at' | 'available_seats'>): Promise<Ride> => {
  await delay(400);
  const rides: Ride[] = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
  
  const newRide: Ride = {
    ...rideData,
    id: Math.random().toString(36).substr(2, 9),
    available_seats: rideData.total_seats,
    created_at: new Date().toISOString(),
  };
  
  rides.push(newRide);
  localStorage.setItem(RIDES_KEY, JSON.stringify(rides));
  return newRide;
};

export const getRides = async (): Promise<Ride[]> => {
  await delay(300);
  const rides: Ride[] = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
  // Sort by departure time (nearest first)
  return rides.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
};

export const getRidesByHost = async (hostId: string): Promise<Ride[]> => {
  await delay(300);
  const rides: Ride[] = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
  return rides.filter(r => r.host_id === hostId);
};

// --- Request Services ---

export const createRideRequest = async (requestData: Omit<RideRequest, 'id' | 'created_at' | 'status'>): Promise<RideRequest> => {
  await delay(400);
  const requests: RideRequest[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  
  // Check for existing pending request
  const existing = requests.find(r => 
    r.ride_id === requestData.ride_id && 
    r.passenger_id === requestData.passenger_id &&
    (r.status === 'pending' || r.status === 'accepted')
  );

  if (existing) {
    throw new Error('You already have a pending or accepted request for this ride.');
  }

  const newRequest: RideRequest = {
    ...requestData,
    id: Math.random().toString(36).substr(2, 9),
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  requests.push(newRequest);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  return newRequest;
};

export const getRequestsForRide = async (rideId: string): Promise<RideRequest[]> => {
  await delay(200);
  const requests: RideRequest[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  return requests.filter(r => r.ride_id === rideId);
};

export const getRequestsByPassenger = async (passengerId: string): Promise<{request: RideRequest, ride: Ride}[]> => {
  await delay(300);
  const requests: RideRequest[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  const rides: Ride[] = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
  
  const myRequests = requests.filter(r => r.passenger_id === passengerId);
  
  // Join with Ride data
  return myRequests.map(req => {
    const ride = rides.find(r => r.id === req.ride_id);
    if (!ride) throw new Error('Ride data missing');
    return { request: req, ride };
  });
};

// Fixed: imported RequestStatus from types to resolve undefined type error
export const updateRequestStatus = async (requestId: string, status: RequestStatus): Promise<void> => {
  await delay(300);
  const requests: RideRequest[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  const rides: Ride[] = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
  
  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) throw new Error('Request not found');

  const request = requests[reqIndex];
  const rideIndex = rides.findIndex(r => r.id === request.ride_id);
  
  if (rideIndex === -1) throw new Error('Ride associated with request not found');
  const ride = rides[rideIndex];

  if (status === 'accepted') {
    if (ride.available_seats <= 0) {
      throw new Error('No seats available');
    }
    ride.available_seats -= 1;
  }

  request.status = status;
  
  // Update DB
  requests[reqIndex] = request;
  rides[rideIndex] = ride;
  
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  localStorage.setItem(RIDES_KEY, JSON.stringify(rides));
};