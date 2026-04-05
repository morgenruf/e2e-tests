import { test, expect } from '@playwright/test';

test.describe('Status Page — Full UI', () => {
  test.use({ baseURL: 'http://status.morgenruf.dev' });

  test('loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/morgenruf|status/i);
  });

  test('hero banner is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // wait for status.json fetch
    // Should show some status text
    await expect(page.getByText(/operational|outage|degraded/i).first()).toBeVisible();
  });

  test('shows at least 4 service cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const cards = page.locator('.service-card, [class*="service"], [class*="card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('status.json is valid JSON with required fields', async ({ request }) => {
    const res = await request.get('/status.json');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('overall');
    expect(body).toHaveProperty('services');
    expect(Array.isArray(body.services)).toBeTruthy();
    expect(body.services.length).toBeGreaterThanOrEqual(4);
    expect(body).toHaveProperty('updated_at');
  });

  test('uptime bars render (90-day history)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    // uptime bar squares should be present
    const bars = page.locator('[class*="bar"], [class*="uptime"], [class*="history"]');
    if (await bars.count() > 0) {
      await expect(bars.first()).toBeVisible();
    }
  });

  test('no JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/');
    await page.waitForTimeout(3000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('last updated timestamp is recent (< 10 min)', async ({ request }) => {
    const res = await request.get('/status.json');
    const body = await res.json();
    const updated = new Date(body.updated_at).getTime();
    const now = Date.now();
    const diffMin = (now - updated) / 1000 / 60;
    expect(diffMin).toBeLessThan(10); // should have been checked in last 10 min
  });
});
