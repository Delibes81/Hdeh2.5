-- Coupon validation now runs through /api/coupons/validate. Remove direct
-- anonymous reads so active codes and discount values cannot be enumerated.

drop policy if exists "Public can read active coupons" on public.coupons;
