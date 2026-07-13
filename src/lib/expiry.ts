const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / DAY_MS);
}

export function effectiveLeadDays(itemLeadDays: number | null, defaultLeadDays: number): number {
  return itemLeadDays ?? defaultLeadDays;
}

export function isExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return false;
  return daysUntil(expiryDate) < 0;
}

export function isExpiringSoon(
  expiryDate: Date | null,
  itemLeadDays: number | null,
  defaultLeadDays: number,
): boolean {
  if (!expiryDate) return false;
  return daysUntil(expiryDate) <= effectiveLeadDays(itemLeadDays, defaultLeadDays);
}
