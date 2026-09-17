export type CarCategory = "Economy" | "Sedan" | "SUV" | "Van" | "Luxury";
export type Transmission = "Automatic" | "Manual";

export interface CarRates {
  daily: number;
  weekly: number;
  monthly: number;
  deposit: number;
}

export interface Car {
  id: string;
  slug: string; // e.g. "toyota-corolla-altis"
  name: string;
  brand: string;
  category: CarCategory;
  transmission: Transmission;
  seats: number;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "CNG";
  engineCc: number;
  year: number;
  color: string;
  rates: CarRates;
  features: string[];
  images: string[];
  featured?: boolean;
  active: boolean;
}

export interface Booking {
  id: string;
  ref: string;
  carId: string;
  customerName: string;
  phone: string;
  pickupArea: string;
  dropoffArea?: string;
  deliveryRequested: boolean;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd (inclusive)
  days: number;
  rentalTotal: number;
  deliveryFee: number;
  deposit: number;
  totalDue: number;
  status: BookingStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled";

export interface BlockedPeriod {
  id: string;
  carId: string;
  startDate: string;
  endDate: string; // inclusive
  reason?: string;
}

/** Effective status of a car for "today" (or any given date). */
export type CarStatus = "available" | "booked" | "blocked" | "retired";

export interface CarStatusInfo {
  status: CarStatus;
  bookingRef?: string;
  bookedUntil?: string;
  blockedReason?: string;
}
