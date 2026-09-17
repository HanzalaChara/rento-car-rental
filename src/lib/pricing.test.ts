import { describe, expect, it } from "vitest";
import { quote, formatPKR } from "./pricing";

const rates = { daily: 1000, weekly: 6000, monthly: 20000, deposit: 5000 };

describe("quote()", () => {
  it("prices short rentals at the daily rate", () => {
    expect(quote({ rates, days: 1 }).rentalTotal).toBe(1000);
    expect(quote({ rates, days: 3 }).rentalTotal).toBe(3000);
    expect(quote({ rates, days: 6 }).rateType).toBe("daily");
  });

  it("switches to weekly rate at 7+ days", () => {
    const q = quote({ rates, days: 7 });
    expect(q.rateType).toBe("weekly");
    expect(q.rentalTotal).toBe(6000);
  });

  it("prices 10 days as one week plus three daily-rate days", () => {
    expect(quote({ rates, days: 10 }).rentalTotal).toBe(6000 + 3000);
  });

  it("switches to monthly rate at 28+ days", () => {
    expect(quote({ rates, days: 28 }).rateType).toBe("monthly");
    expect(quote({ rates, days: 28 }).rentalTotal).toBe(20000);
  });

  it("prices 35 days as one month plus one week", () => {
    // 35 days = 28 + 7 → month + weekly remainder
    expect(quote({ rates, days: 35 }).rentalTotal).toBe(20000 + 6000);
  });

  it("prices 32 days as one month plus four daily-rate days", () => {
    expect(quote({ rates, days: 32 }).rentalTotal).toBe(20000 + 4 * 1000);
  });

  it("adds delivery fee only when requested", () => {
    expect(quote({ rates, days: 3, deliveryFee: 1500, withDelivery: true }).deliveryFee).toBe(1500);
    expect(quote({ rates, days: 3, deliveryFee: 1500, withDelivery: false }).deliveryFee).toBe(0);
  });

  it("always includes the refundable deposit in total due", () => {
    const q = quote({ rates, days: 2 });
    expect(q.totalDue).toBe(2000 + 5000);
    expect(q.deposit).toBe(5000);
  });
});

describe("formatPKR()", () => {
  it("formats with thousands separators", () => {
    expect(formatPKR(12500)).toMatch(/12[,.]?500/);
    expect(formatPKR(1000000)).toMatch(/1[,.]?000[,.]?000/);
  });
});
