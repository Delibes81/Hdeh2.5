export function isCouponUsageAvailable(
  usageLimit: number | null,
  usedCount: number | null,
  activeReservations: number | null,
): boolean {
  if (usageLimit === null) return true;

  const used = Math.max(0, usedCount ?? 0);
  const reserved = Math.max(0, activeReservations ?? 0);
  return used + reserved < Math.max(0, usageLimit);
}
