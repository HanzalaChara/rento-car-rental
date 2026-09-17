import type { CarRates } from "../types";

export interface Quote {
  days: number;
  rateType: "daily" | "weekly" | "monthly";
  baseRate: number;
  rentalTotal: number;
  deliveryFee: number;
  deposit: number;
  totalDue: number;
}

export interface QuoteInput {
  rates: CarRates;
  days: number;
  deliveryFee?: number;
  withDelivery?: boolean;
}

export function quote(input: QuoteInput): Quote {
  const { rates, days } = input;
  const rateType = days >= 28 ? "monthly" : days >= 7 ? "weekly" : "daily";
  const baseRate =
    rateType === "monthly"
      ? rates.monthly
      : rateType === "weekly"
        ? rates.weekly
        : rates.daily;

  let rentalTotal: number;
  if (rateType === "monthly") {
    const months = Math.floor(days / 28);
    const remainder = days % 28;
    const remainderCost = remainder >= 7 ? Math.ceil(remainder / 7) * rates.weekly : remainder * rates.daily;
    rentalTotal = months * rates.monthly + remainderCost;
  } else if (rateType === "weekly") {
    const weeks = Math.floor(days / 7);
    const rem = days % 7;
    rentalTotal = weeks * rates.weekly + rem * rates.daily;
  } else {
    rentalTotal = days * rates.daily;
  }

  const deliveryFee = input.withDelivery ? (input.deliveryFee ?? 0) : 0;
  const deposit = input.rates.deposit;
  const totalDue = rentalTotal + deliveryFee + deposit;

  return { days, rateType, baseRate, rentalTotal, deliveryFee, deposit, totalDue };
}

/** Format a PKR amount with thousands separators. */
export function formatPKR(amount: number): string {
  return "PKR " + amount.toLocaleString("en-PK");
}
