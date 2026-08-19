import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoSeriousAccessibilityViolations(page: Page, include?: string) {
  let audit = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

  if (include) audit = audit.include(include);
  const results = await audit.analyze();

  const blockingViolations = results.violations
    .filter(({ impact }) => impact === 'serious' || impact === 'critical')
    .map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      targets: nodes.map(({ target }) => target.join(' ')),
    }));

  expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
}

async function waitForFiniteAnimations(page: Page, selector = 'body') {
  await page.locator(selector).evaluate(async (element) => {
    const finiteAnimations = element.getAnimations({ subtree: true }).filter((animation) => {
      const endTime = animation.effect?.getComputedTiming().endTime;
      return typeof endTime === 'number' && Number.isFinite(endTime);
    });

    await Promise.all(finiteAnimations.map((animation) => animation.finished.catch(() => undefined)));
  });
}

test('la portada, el catálogo y el detalle no tienen barreras serias de accesibilidad', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Tu historia empieza con un solo paso.' })).toBeVisible();
  await waitForFiniteAnimations(page);
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto('/shop');

  const firstProduct = page.locator('a[href^="/shop/"]').first();
  await expect(firstProduct).toBeVisible();
  const productHref = await firstProduct.getAttribute('href');

  await waitForFiniteAnimations(page);
  await expectNoSeriousAccessibilityViolations(page);

  expect(productHref).toBeTruthy();
  await page.goto(productHref!);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await waitForFiniteAnimations(page);
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByTestId('product-size').first().click();
  await page.getByTestId('add-to-cart').click();
  await page.getByRole('button', { name: 'Carrito de compras' }).click();
  await expect(page.getByRole('heading', { name: 'Tu Carrito' })).toBeVisible();

  await waitForFiniteAnimations(page, '[role="dialog"]');

  await expectNoSeriousAccessibilityViolations(page, '[role="dialog"]');
});
