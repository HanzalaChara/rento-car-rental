import type { BlockedPeriod, Booking, BookingStatus } from "../types";
import { getSupabase, supabaseEnabled } from "../lib/supabase";
import { makeBookingRef, makeId } from "../lib/refs";

/**
 * Booking repository — two interchangeable backends:
 *  • SupabaseBackend  → bookings sync to the cloud; admin sees them on any device.
 *  • LocalBackend     → demo mode; data lives in localStorage of one device.
 * The UI only talks to the interface, so switching is invisible to components.
 */

export interface NewBookingInput {
  carId: string;
  customerName: string;
  phone: string;
  pickupArea: string;
  dropoffArea?: string;
  deliveryRequested: boolean;
  startDate: string;
  endDate: string;
  days: number;
  rentalTotal: number;
  deliveryFee: number;
  deposit: number;
  totalDue: number;
  note?: string;
}

export interface BookingRepo {
  readonly backend: "supabase" | "local";
  listBookings(): Promise<Booking[]>;
  listBlocked(): Promise<BlockedPeriod[]>;
  getBookingByRef(ref: string): Promise<Booking | null>;
  createBooking(input: NewBookingInput): Promise<Booking>;
  updateStatus(id: string, status: BookingStatus): Promise<void>;
  addBlockedPeriod(carId: string, startDate: string, endDate: string, reason?: string): Promise<void>;
  removeBlockedPeriod(id: string): Promise<void>;
  /** Double-booking guard; Supabase also enforces this at the database level. */
  assertNoOverlap(carId: string, startDate: string, endDate: string, ignoreBookingId?: string): Promise<void>;
}

/* ────────────────────────── Local (demo) backend ────────────────────────── */

const B_KEY = "rento.bookings.v1";
const P_KEY = "rento.blocked.v1";

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export class LocalBackend implements BookingRepo {
  readonly backend = "local" as const;

  async listBookings(): Promise<Booking[]> {
    return readLS<Booking[]>(B_KEY, []);
  }

  async listBlocked(): Promise<BlockedPeriod[]> {
    return readLS<BlockedPeriod[]>(P_KEY, []);
  }

  async getBookingByRef(ref: string): Promise<Booking | null> {
    const all = await this.listBookings();
    return all.find((b) => b.ref === ref) ?? null;
  }

  async createBooking(input: NewBookingInput): Promise<Booking> {
    const bookings = await this.listBookings();
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const countForYear = bookings.filter((b) => b.ref.includes(`-${year}-`)).length;
    const booking: Booking = {
      id: makeId("bk"),
      ref: makeBookingRef(countForYear, year),
      status: "pending",
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    bookings.push(booking);
    writeLS(B_KEY, bookings);
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    const bookings = await this.listBookings();
    const b = bookings.find((x) => x.id === id);
    if (b) {
      b.status = status;
      b.updatedAt = new Date().toISOString();
      writeLS(B_KEY, bookings);
    }
  }

  async addBlockedPeriod(carId: string, startDate: string, endDate: string, reason?: string): Promise<void> {
    const periods = await this.listBlocked();
    periods.push({ id: makeId("bp"), carId, startDate, endDate, reason });
    writeLS(P_KEY, periods);
  }

  async removeBlockedPeriod(id: string): Promise<void> {
    const periods = await this.listBlocked();
    writeLS(
      P_KEY,
      periods.filter((p) => p.id !== id),
    );
  }

  async assertNoOverlap(
    carId: string,
    startDate: string,
    endDate: string,
    ignoreBookingId?: string,
  ): Promise<void> {
    const bookings = await this.listBookings();
    const clash = bookings.find(
      (b) =>
        b.carId === carId &&
        BLOCKING.has(b.status) &&
        b.id !== ignoreBookingId &&
        b.startDate <= endDate &&
        startDate <= b.endDate,
    );
    if (clash) throw new Error(`Double booking: car already has booking ${clash.ref} in those dates`);
  }
}

const BLOCKING = new Set(["pending", "confirmed", "active"]);

/* ───────────────────────── Supabase (cloud) backend ─────────────────────── */

const COLUMNS = [
  "id, ref, car_id, customer_name, phone, pickup_area, dropoff_area, delivery_requested, start_date, end_date, days, rental_total, delivery_fee, deposit, total_due, status, note, created_at, updated_at",
].join("");

interface SBBooking {
  id: string;
  ref: string;
  car_id: string;
  customer_name: string;
  phone: string;
  pickup_area: string;
  dropoff_area: string | null;
  delivery_requested: boolean;
  start_date: string;
  end_date: string;
  days: number;
  rental_total: number;
  delivery_fee: number;
  deposit: number;
  total_due: number;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

function rowToBooking(r: SBBooking): Booking {
  return {
    id: r.id,
    ref: r.ref,
    carId: r.car_id,
    customerName: r.customer_name,
    phone: r.phone,
    pickupArea: r.pickup_area,
    dropoffArea: r.dropoff_area ?? undefined,
    deliveryRequested: r.delivery_requested,
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.days,
    rentalTotal: r.rental_total,
    deliveryFee: r.delivery_fee,
    deposit: r.deposit,
    totalDue: r.total_due,
    status: r.status as BookingStatus,
    note: r.note ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export class SupabaseBackend implements BookingRepo {
  readonly backend = "supabase" as const;

  private sb() {
    const sb = getSupabase();
    if (!sb) throw new Error("Supabase is not configured");
    return sb;
  }

  async listBookings(): Promise<Booking[]> {
    const sb = this.sb();
    const { data, error } = await sb.from("bookings").select(COLUMNS).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToBooking(r as unknown as SBBooking));
  }

  async listBlocked(): Promise<BlockedPeriod[]> {
    const sb = this.sb();
    const { data, error } = await sb.from("blocked_periods").select("*").order("start_date");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: { id: string; car_id: string; start_date: string; end_date: string; reason: string | null }) => ({
      id: r.id,
      carId: r.car_id,
      startDate: r.start_date,
      endDate: r.end_date,
      reason: r.reason ?? undefined,
    }));
  }

  async getBookingByRef(ref: string): Promise<Booking | null> {
    const sb = this.sb();
    const { data, error } = await sb.from("bookings").select(COLUMNS).eq("ref", ref).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowToBooking(data as unknown as SBBooking) : null;
  }

  async createBooking(input: NewBookingInput): Promise<Booking> {
    const sb = this.sb();
    await this.assertNoOverlap(input.carId, input.startDate, input.endDate);
    const year = new Date().getFullYear();
    const { count, error: countErr } = await sb
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .like("ref", `KR-${year}-%`);
    if (countErr) throw new Error(countErr.message);
    const ref = makeBookingRef(count ?? 0, year);

    const row = {
      ref,
      car_id: input.carId,
      customer_name: input.customerName,
      phone: input.phone,
      pickup_area: input.pickupArea,
      dropoff_area: input.dropoffArea ?? null,
      delivery_requested: input.deliveryRequested,
      start_date: input.startDate,
      end_date: input.endDate,
      days: input.days,
      rental_total: input.rentalTotal,
      delivery_fee: input.deliveryFee,
      deposit: input.deposit,
      total_due: input.totalDue,
      status: "pending",
      note: input.note ?? null,
    };

    const { data, error } = await sb.from("bookings").insert(row).select(COLUMNS).single();
    if (error) throw new Error(error.message);
    return rowToBooking(data as unknown as SBBooking);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    const sb = this.sb();
    const { error } = await sb
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async addBlockedPeriod(carId: string, startDate: string, endDate: string, reason?: string): Promise<void> {
    const sb = this.sb();
    const { error } = await sb.from("blocked_periods").insert({ car_id: carId, start_date: startDate, end_date: endDate, reason: reason ?? null });
    if (error) throw new Error(error.message);
  }

  async removeBlockedPeriod(id: string): Promise<void> {
    const sb = this.sb();
    const { error } = await sb.from("blocked_periods").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async assertNoOverlap(
    carId: string,
    startDate: string,
    endDate: string,
    ignoreBookingId?: string,
  ): Promise<void> {
    const sb = this.sb();
    let q = sb
      .from("bookings")
      .select("id, ref", { count: "exact", head: false })
      .eq("car_id", carId)
      .in("status", ["pending", "confirmed", "active"])
      .lte("start_date", endDate)
      .gte("end_date", startDate);
    if (ignoreBookingId) q = q.neq("id", ignoreBookingId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    if (data && data.length > 0) {
      throw new Error(`Double booking: car already has booking ${data[0].ref} in those dates`);
    }
  }
}

/* ─────────────────────────────── Factory ────────────────────────────────── */

let repo: BookingRepo | null = null;

export function getRepo(): BookingRepo {
  if (!repo) {
    repo = supabaseEnabled ? new SupabaseBackend() : new LocalBackend();
  }
  return repo;
}
