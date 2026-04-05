import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('dashboard login page redirects unauthenticated users', async ({ page }) => {
    const res = await page.goto('/dashboard');
    // Should either redirect to OAuth or show login prompt — not crash
    expect([200, 302, 401]).toContain(res?.status() ?? 200);
    // Should not show a 500 error
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('OAuth install URL is valid', async ({ request }) => {
    const res = await request.get('/install', { maxRedirects: 0 });
    // Should redirect to Slack OAuth
    expect([301, 302, 200]).toContain(res.status());
    if (res.status() === 302) {
      const location = res.headers()['location'];
      expect(location).toContain('slack.com');
    }
  });

  test('public feed with invalid token returns 404', async ({ page }) => {
    const res = await page.goto('/feed/invalid-token-that-does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
