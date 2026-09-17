/**
 * RENTO — business configuration.
 * ─────────────────────────────────
 * THIS IS THE ONE FILE YOU EDIT to make the site yours.
 * Replace the placeholder phone numbers and payment details below.
 */

export const site = {
  name: "RENTO",
  tagline: "Premium Car Rental — Karachi",
  city: "Karachi, Pakistan",

  // ⚠️ Replace with your real numbers (country code, no +, no spaces)
  phone: "923001234567", // for tel: links
  whatsapp: "923001234567", // wa.me links

  email: "bookings@rento.pk",

  address: "Shop #12, Khayaban-e-Bukhari, DHA Phase 6, Karachi",

  hours: "Open daily · 9:00 AM – 11:00 PM",

  // Payment details shown on the booking confirmation page.
  // ⚠️ Replace account numbers with your real ones.
  payments: {
    jazzcash: {
      accountName: "RENTO Rentals",
      accountNumber: "0300-1234567",
    },
    easypaisa: {
      accountName: "RENTO Rentals",
      accountNumber: "0300-1234567",
    },
    bank: {
      bankName: "Meezan Bank",
      accountTitle: "RENTO Rentals",
      accountNumber: "0123 0102 4567 8901",
      iban: "PK00MEZN0001230102456789",
    },
  },

  /** Flat fee for home/office delivery within Karachi (PKR). */
  deliveryFee: 1500,

  areas: [
    "DHA",
    "Clifton",
    "PECHS",
    "Gulshan-e-Iqbal",
    "Bahadurabad",
    "North Nazimabad",
    "Gulistan-e-Johar",
    "Malir Cantt",
    "Airport",
  ],

  socials: {
    facebook: "https://facebook.com/rento.pk",
    instagram: "https://instagram.com/rento.pk",
  },
};

/** Build a wa.me deep link with an optional pre-filled message. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
