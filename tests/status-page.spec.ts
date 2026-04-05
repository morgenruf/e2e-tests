import { test, expect } from '@playwright/test';

test.describe('Status Page', () => {
  test.use({ baseURL: 'http://status.morgenruf.dev' });

  test('status page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/status|morgenruf/i);
  });

  test('shows operational status', async ({ page }) => {
    await page.goto('/');
    // Wait for JS to fetch status.json and update UI
    await page.waitForTimeout(2000);
    const hero = page.locator('.hero, .status-hero, [class*="hero"]').first();
    await expect(hero).toBeVisible();
  });

  test('shows service cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Should show at least the API service card
    const cards = page.locator('.service-card, .service, [class*="service"]');
    await expect(cards.first()).toBeVisible();
  });
});
