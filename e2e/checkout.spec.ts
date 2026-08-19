import { expect, test } from '@playwright/test';

test('un cliente puede preparar su compra sin iniciar un cargo real', async ({ page }) => {
  await page.route('**/api/coupons/validate', async (route) => {
    const body = route.request().postDataJSON() as { code?: string };
    const isValid = body.code?.trim().toUpperCase() === 'PRUEBA20';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        isValid
          ? {
              valid: true,
              coupon: {
                code: 'PRUEBA20',
                discountType: 'percentage',
                discountValue: 20,
              },
            }
          : { valid: false, error: 'Cupón inválido o inactivo' },
      ),
    });
  });

  await page.route('**/functions/v1/create-checkout-session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'http://localhost:3000/success' }),
    });
  });

  await page.goto('/shop');

  const firstProduct = page.locator('a[href^="/shop/"]').first();
  await expect(firstProduct).toBeVisible();
  const productName = (await firstProduct.locator('h3').textContent())?.trim() ?? '';
  await firstProduct.click();

  await expect(page).toHaveURL(/\/shop\/[^/]+$/);
  await expect(page.getByRole('heading', { level: 1, name: productName })).toBeVisible();

  await page.getByTestId('product-size').first().click();
  await expect(page.getByTestId('add-to-cart')).toBeEnabled();
  await page.getByTestId('add-to-cart').click();
  await page.getByRole('button', { name: 'Carrito de compras' }).click();

  await expect(page.getByRole('heading', { name: 'Tu Carrito' })).toBeVisible();
  await expect(page.getByText(productName, { exact: true }).first()).toBeVisible();

  await page.getByTestId('coupon-input').fill('NO-VALIDO');
  await page.getByTestId('apply-coupon').click();
  await expect(page.getByText('Cupón inválido o inactivo')).toBeVisible();

  await page.getByTestId('coupon-input').fill('PRUEBA20');
  await page.getByTestId('apply-coupon').click();
  await expect(page.getByText('20% de descuento')).toBeVisible();

  await page.getByTestId('checkout').click();
  await expect(page).toHaveURL('/success');
  await expect(page.getByRole('heading', { name: '¡Gracias por tu compra!' })).toBeVisible();
});
