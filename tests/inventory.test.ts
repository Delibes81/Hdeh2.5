import assert from 'node:assert/strict';
import test from 'node:test';

import type { Product } from '../src/types/index.ts';
import { getProductionQuantity } from '../src/utils/inventory.ts';

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Modelo de prueba',
    price: 1000,
    category: 'zapatos-bajos',
    images: [],
    description: '',
    materials: [],
    variants: [{ id: 'variant-1', size: '4 MX', stock: 2 }],
    ...overrides,
  };
}

test('no requiere fabricación cuando el inventario cubre la cantidad', () => {
  assert.equal(getProductionQuantity(createProduct(), '4 MX', 2), 0);
});

test('solo manda a fabricación las unidades que exceden el inventario', () => {
  assert.equal(getProductionQuantity(createProduct(), '4 MX', 5), 3);
});

test('manda toda la cantidad a fabricación si la talla no tiene inventario', () => {
  assert.equal(getProductionQuantity(createProduct(), '5 MX', 3), 3);
});

test('los productos sobre pedido siempre se fabrican completos', () => {
  const product = createProduct({ isMadeToOrder: true });
  assert.equal(getProductionQuantity(product, '4 MX', 2), 2);
});

test('nunca devuelve cantidades negativas', () => {
  const product = createProduct({
    variants: [{ id: 'variant-1', size: '4 MX', stock: -5 }],
  });
  assert.equal(getProductionQuantity(product, '4 MX', -1), 0);
});
