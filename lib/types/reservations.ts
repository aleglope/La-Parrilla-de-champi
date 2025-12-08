// Types for the Reservation System

export type ReservationSource = "web" | "phone";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "no_show"
  | "completed";

export interface TimeSlot {
  id: string;
  time: string; // HH:MM format
  maxCapacity: number;
  isActive: boolean;
  createdAt: string;
  availableSpots?: number; // Calculated field
}

export interface AvailabilitySetting {
  id: string;
  date: string; // YYYY-MM-DD format
  isOpen: boolean;
  maxCapacity: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  reservationDate: string; // YYYY-MM-DD format
  timeSlot: string; // HH:MM format
  guestsCount: number;
  specialRequests: string | null;
  source: ReservationSource;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationDto {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  reservationDate: string;
  timeSlot: string;
  guestsCount: number;
  specialRequests?: string;
  source?: ReservationSource;
}

export interface UpdateReservationStatusDto {
  status: ReservationStatus;
}

export interface AvailabilityCheckResult {
  available: boolean;
  currentBookings: number;
  maxCapacity: number;
  remainingCapacity: number;
}

export interface DayAvailability {
  date: string;
  isOpen: boolean;
  timeSlots: Array<{
    time: string;
    available: boolean;
    remainingCapacity: number;
  }>;
}

export interface ReservationStats {
  totalReservations: number;
  totalGuests: number;
  bySource: Record<ReservationSource, number>;
  byStatus: Record<ReservationStatus, number>;
  avgPartySize: number;
}

// Form validation types
export interface ReservationFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  reservationDate: string;
  timeSlot: string;
  guestsCount: number;
  specialRequests: string;
  consent: boolean;
}

export interface ReservationFormErrors {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  reservationDate?: string;
  timeSlot?: string;
  guestsCount?: string;
  consent?: string;
  general?: string;
}
