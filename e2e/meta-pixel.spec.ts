import { expect, test, type Page } from '@playwright/test';

type MetaPixelCall = [command: string, eventOrId?: string, parameters?: Record<string, unknown>];

async function getMetaPixelCalls(page: Page): Promise<MetaPixelCall[]> {
  return page.evaluate(() => {
    const pixel = window.fbq as (typeof window.fbq & { queue?: ArrayLike<unknown>[] }) | undefined;
    return (pixel?.queue ?? []).map((call) => Array.from(call)) as MetaPixelCall[];
  });
}

async function expectMetaEvent(page: Page, eventName: string) {
  await expect.poll(async () => {
    const calls = await getMetaPixelCalls(page);
    return calls.some(([command, event]) => command === 'track' && event === eventName);
  }).toBe(true);
}

test('Meta Pixel registra el recorrido de compra sin crear un cargo', async ({ page }) => {
  await page.route('https://connect.facebook.net/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });

  await page.route('**/functions/v1/create-checkout-session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'http://localhost:3000/success?session_id=cs_test_meta_pixel' }),
    });
  });

  await page.goto('/');
  await expectMetaEvent(page, 'PageView');

  await page.goto('/shop');
  const firstProduct = page.locator('a[href^="/shop/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();

  await expectMetaEvent(page, 'ViewContent');

  await page.getByTestId('product-size').first().click();
  await page.getByTestId('add-to-cart').click();
  await expectMetaEvent(page, 'AddToCart');

  await page.getByRole('button', { name: 'Carrito de compras' }).click();
  await page.getByTestId('checkout').click();
  await expect(page).toHaveURL('/success?session_id=cs_test_meta_pixel');
  await expectMetaEvent(page, 'Purchase');

  const purchaseCalls = (await getMetaPixelCalls(page)).filter(
    ([command, event]) => command === 'track' && event === 'Purchase',
  );
  expect(purchaseCalls).toHaveLength(1);
  expect(purchaseCalls[0]?.[2]).toMatchObject({ currency: 'MXN' });
});
