export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  erp_id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name: string;
  gender: string;
  graduating_year: number;
  contact_number: string;
  role: UserRole;
  sec_question_1: string;
  sec_answer_1: string;
  sec_question_2: string;
  sec_answer_2: string;
}

export interface Ride {
  id: string;
  host_id: string;
  host_name: string; // Denormalized for easier display
  departure_location: string;
  destination_location: string;
  departure_time: string; // ISO string
  fare: number | null; // Suggested price
  total_seats: number;
  available_seats: number;
  created_at: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface RideRequest {
  id: string;
  ride_id: string;
  passenger_id: string;
  passenger_name: string;
  offered_price: number | null;
  comment: string;
  status: RequestStatus;
  created_at: string;
}

// Helper types for UI
export type PageView = 
  | 'login' 
  | 'signup' 
  | 'forgot-password' 
  | 'dashboard' 
  | 'post-ride' 
  | 'browse-rides' 
  | 'my-rides' 
  | 'my-requests';
