import type { BlockedPeriod, Booking, Car } from "../types";
import { rangesOverlap, todayISO } from "./dates";

const BLOCKING_STATUSES = new Set(["pending", "confirmed", "active"]);

/** Bookings that block the calendar (pending holds the car too). */
export function blockingBookings(bookings: Booking[], carId: string): Booking[] {
  return bookings.filter((b) => b.carId === carId && BLOCKING_STATUSES.has(b.status));
}

export function blockedPeriodsFor(periods: BlockedPeriod[], carId: string): BlockedPeriod[] {
  return periods.filter((p) => p.carId === carId);
}

export interface AvailabilityCheck {
  available: boolean;
  reason?: string;
}

/** Is [startDate, endDate] free for this car, ignoring one existing booking? */
export function isRangeAvailable(
  car: Car,
  bookings: Booking[],
  blocked: BlockedPeriod[],
  startDate: string,
  endDate: string,
  ignoreBookingId?: string,
): AvailabilityCheck {
  if (startDate > endDate) return { available: false, reason: "End date is before start date" };
  if (!car.active) return { available: false, reason: "This car is currently unavailable" };

  for (const b of blockingBookings(bookings, car.id)) {
    if (b.id === ignoreBookingId) continue;
    if (rangesOverlap(startDate, endDate, b.startDate, b.endDate)) {
      return { available: false, reason: `Already booked (${b.ref}) for those dates` };
    }
  }
  for (const p of blockedPeriodsFor(blocked, car.id)) {
    if (rangesOverlap(startDate, endDate, p.startDate, p.endDate)) {
      return { available: false, reason: p.reason ? `Unavailable: ${p.reason}` : "Unavailable for maintenance" };
    }
  }
  return { available: true };
}

/** Effective fleet-board status of a car on a given date. */
export function carStatusOn(
  car: Car,
  bookings: Booking[],
  blocked: BlockedPeriod[],
  onDate: string = todayISO(),
) {
  if (!car.active) return { status: "retired" as const };

  for (const b of blockingBookings(bookings, car.id)) {
    if (b.startDate <= onDate && onDate <= b.endDate) {
      return { status: "booked" as const, bookingRef: b.ref, bookedUntil: b.endDate };
    }
  }
  for (const p of blockedPeriodsFor(blocked, car.id)) {
    if (p.startDate <= onDate && p.endDate >= onDate) {
      return { status: "blocked" as const, blockedReason: p.reason };
    }
  }
  return { status: "available" as const };
}
