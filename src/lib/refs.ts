/** Human-friendly booking references, e.g. KR-2026-0142. */
export function makeBookingRef(existingCount: number, year = new Date().getFullYear()): string {
  return `KR-${year}-${String(existingCount + 1).padStart(4, "0")}`;
}

export function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
