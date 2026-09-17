import { describe, expect, it } from "vitest";
import { addDaysISO, diffDays, isValidISO, rangesOverlap, rentalDays } from "./dates";
import { isRangeAvailable } from "./availability";
import { makeBookingRef } from "./refs";
import type { BlockedPeriod, Booking, Car } from "../types";

const car: Car = {
  id: "car-001",
  slug: "test-car",
  name: "Test Car",
  brand: "Test",
  category: "Sedan",
  transmission: "Automatic",
  seats: 5,
  fuelType: "Petrol",
  engineCc: 1500,
  year: 2023,
  color: "White",
  rates: { daily: 8000, weekly: 48000, monthly: 150000, deposit: 15000 },
  features: [],
  images: [],
  active: true,
};

function booking(id: string, start: string, end: string, status: Booking["status"] = "confirmed"): Booking {
  const days = rentalDays(start, end);
  return {
    id,
    ref: id.toUpperCase(),
    carId: car.id,
    customerName: "Test",
    phone: "03001234567",
    pickupArea: "DHA",
    deliveryRequested: false,
    startDate: start,
    endDate: end,
    days,
    rentalTotal: 1000 * days,
    deliveryFee: 0,
    deposit: 1000,
    totalDue: 1000 * days + 1000,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("dates", () => {
  it("computes inclusive rental days", () => {
    expect(rentalDays("2026-03-01", "2026-03-01")).toBe(1);
    expect(rentalDays("2026-03-01", "2026-03-02")).toBe(2);
  });

  it("adds days across month boundaries", () => {
    expect(addDaysISO("2026-01-30", 5)).toBe("2026-02-04");
  });

  it("detects overlapping ranges including endpoints", () => {
    expect(rangesOverlap("2026-03-01", "2026-03-05", "2026-03-05", "2026-03-08")).toBe(true);
    expect(rangesOverlap("2026-03-01", "2026-03-05", "2026-03-06", "2026-03-08")).toBe(false);
  });

  it("validates ISO dates", () => {
    expect(isValidISO("2026-02-28")).toBe(true);
    expect(isValidISO("2026-02-30")).toBe(false);
    expect(isValidISO("2026-13-01")).toBe(false);
  });

  it("diffDays handles UTC-safe arithmetic", () => {
    expect(diffDays("2026-03-01", "2026-03-10")).toBe(9);
  });
});

describe("isRangeAvailable()", () => {
  const bookings = [booking("BK1", "2026-03-05", "2026-03-08")];

  it("blocks a range inside an existing booking", () => {
    const r = isRangeAvailable(car, bookings, [], "2026-03-06", "2026-03-07");
    expect(r.available).toBe(false);
  });

  it("allows a range that starts the day after return", () => {
    const r = isRangeAvailable(car, bookings, [], "2026-03-09", "2026-03-10");
    expect(r.available).toBe(true);
  });

  it("treats touching end dates as a conflict (car returned same day)", () => {
    const r = isRangeAvailable(car, bookings, [], "2026-03-08", "2026-03-09");
    expect(r.available).toBe(false);
  });

  it("blocks pending bookings too — they hold the car", () => {
    const r = isRangeAvailable(car, [booking("BK2", "2026-03-05", "2026-03-08", "pending")], [], "2026-03-06", "2026-03-07");
    expect(r.available).toBe(false);
  });

  it("ignores cancelled bookings", () => {
    const r = isRangeAvailable(car, [booking("BK3", "2026-03-05", "2026-03-08", "cancelled")], [], "2026-03-06", "2026-03-07");
    expect(r.available).toBe(true);
  });

  it("ignores the same booking when editing (ignoreBookingId)", () => {
    const r = isRangeAvailable(car, bookings, [], "2026-03-06", "2026-03-07", "BK1");
    expect(r.available).toBe(true);
  });

  it("treats blocked maintenance periods as unavailable", () => {
    const blocked: BlockedPeriod[] = [{ id: "p1", carId: car.id, startDate: "2026-03-10", endDate: "2026-03-12", reason: "Service" }];
    const r = isRangeAvailable(car, [], blocked, "2026-03-11", "2026-03-11");
    expect(r.available).toBe(false);
  });

  it("rejects inverted ranges and inactive cars", () => {
    expect(isRangeAvailable(car, [], [], "2026-03-08", "2026-03-05").available).toBe(false);
    expect(isRangeAvailable({ ...car, active: false }, [], [], "2026-03-08", "2026-03-09").available).toBe(false);
  });
});

describe("refs", () => {
  it("builds sequential booking references", () => {
    expect(makeBookingRef(0, 2026)).toBe("KR-2026-0001");
    expect(makeBookingRef(41, 2026)).toBe("KR-2026-0042");
  });
});
