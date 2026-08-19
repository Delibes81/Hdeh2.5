import type { Product } from '../types';

export function getProductionQuantity(
  product: Product,
  size: string,
  quantity: number,
): number {
  if (product.isMadeToOrder) return Math.max(0, quantity);

  const stock = product.variants?.find((variant) => variant.size === size)?.stock ?? 0;
  return Math.max(0, quantity - Math.max(0, stock));
}
