import assert from 'node:assert/strict';
import test from 'node:test';

import { isCouponUsageAvailable } from '../src/utils/coupons.ts';

test('un cupón sin límite siempre tiene disponibilidad', () => {
  assert.equal(isCouponUsageAvailable(null, 100, 100), true);
});

test('considera juntos los usos pagados y las reservas activas', () => {
  assert.equal(isCouponUsageAvailable(5, 2, 2), true);
  assert.equal(isCouponUsageAvailable(5, 2, 3), false);
});

test('rechaza un cupón que ya alcanzó o excedió su límite', () => {
  assert.equal(isCouponUsageAvailable(2, 2, 0), false);
  assert.equal(isCouponUsageAvailable(2, 3, 0), false);
});

test('trata conteos ausentes o negativos como cero', () => {
  assert.equal(isCouponUsageAvailable(1, null, null), true);
  assert.equal(isCouponUsageAvailable(1, -2, -3), true);
});
