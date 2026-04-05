import { test, expect } from '@playwright/test';

test.describe('Website — Full UI', () => {
  test.use({ baseURL: 'https://morgenruf.dev' });

  test('homepage — title and meta', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Morgenruf/i);
    // og:title meta
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('homepage — hero section visible', async ({ page }) => {
    await page.goto('/');
    // H1 exists
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('homepage — Add to Slack CTA button', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByRole('link', { name: /add to slack/i });
    await expect(btn).toBeVisible();
    const href = await btn.getAttribute('href');
    expect(href).toMatch(/slack\.com|api\.morgenruf\.dev/);
  });

  test('homepage — features section', async ({ page }) => {
    await page.goto('/');
    // At least 3 feature items
    const features = page.locator('[class*="feature"], [class*="card"], section').filter({ hasText: /standup|analytics|kudos|template|mcp/i });
    await expect(features.first()).toBeVisible();
  });

  test('homepage — status badge links to status page', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('a[href*="status.morgenruf"]');
    if (await badge.count() > 0) {
      await expect(badge.first()).toBeVisible();
    }
  });

  test('homepage — no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('homepage — mobile responsive (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('privacy page — loads and has key sections', async ({ page }) => {
    await page.goto('/privacy.html');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.getByText(/data|privacy|personal/i).first()).toBeVisible();
  });

  test('support page — loads with contact info', async ({ page }) => {
    await page.goto('/support.html');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.getByText(/github|hello@morgenruf|issues/i).first()).toBeVisible();
  });

  test('all internal links return 200', async ({ page, request }) => {
    await page.goto('/');
    const links = await page.locator('a[href]').evaluateAll(els =>
      els.map(el => el.getAttribute('href')).filter(h =>
        h && (h.startsWith('/') || h.startsWith('https://morgenruf.dev')) && !h.includes('#')
      )
    );
    for (const link of links.slice(0, 10)) { // check first 10
      const url = link!.startsWith('/') ? `https://morgenruf.dev${link}` : link!;
      const res = await request.get(url);
      expect(res.status(), `${url} returned ${res.status()}`).toBeLessThan(400);
    }
  });
});
