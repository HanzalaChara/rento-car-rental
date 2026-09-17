import { getRepo } from "../data/repo";
import type { BlockedPeriod, Booking } from "../types";

export interface FleetQueryData {
  bookings: Booking[];
  blocked: BlockedPeriod[];
}

export async function loadFleetData(): Promise<FleetQueryData> {
  const repo = getRepo();
  const [bookings, blocked] = await Promise.all([repo.listBookings(), repo.listBlocked()]);
  return { bookings, blocked };
}
