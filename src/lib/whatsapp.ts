import { waLink } from "../data/site";
import type { Booking } from "../types";
import { formatPKR } from "./pricing";
import { formatISO } from "./dates";

export function generalInquiryLink(): string {
  return waLink("Hello RENTO! I want to ask about renting a car in Karachi.");
}

export function carInquiryLink(carName: string): string {
  return waLink(`Hello RENTO! I'm interested in the ${carName}. Is it available?`);
}

export function bookingDetailsLink(booking: Booking, carName: string): string {
  const lines = [
    `Hello RENTO! I just booked online:`,
    ``,
    `📋 Booking: ${booking.ref}`,
    `🚗 Car: ${carName}`,
    `📅 ${formatISO(booking.startDate)} → ${formatISO(booking.endDate)} (${booking.days} day${booking.days > 1 ? "s" : ""})`,
    `📍 Pickup: ${booking.pickupArea}`,
    booking.deliveryRequested ? `🏠 Home delivery requested` : null,
    `💰 Total: ${formatPKR(booking.totalDue)} (incl. refundable deposit)`,
    ``,
    `Please confirm my booking. Thank you!`,
  ].filter((l): l is string => l !== null);
  return waLink(lines.join("\n"));
}
