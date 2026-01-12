// Types pour l'application EasyBooking

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipments: string[];
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  // Relations
  room?: Room;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

// Types pour les formulaires
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BookingFormData {
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
