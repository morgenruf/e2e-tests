import { test, expect } from '@playwright/test';

test.describe('Morgenruf Website', () => {
  test.use({ baseURL: 'https://morgenruf.dev' });

  test('homepage loads and has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Morgenruf/);
  });

  test('homepage hero has Add to Slack button', async ({ page }) => {
    await page.goto('/');
    const slackBtn = page.getByRole('link', { name: /add to slack/i });
    await expect(slackBtn).toBeVisible();
  });

  test('homepage has status badge', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('#site-status-badge, .status-indicator, [href*="status.morgenruf"]');
    await expect(badge).toBeVisible();
  });

  test('pricing page or section exists', async ({ page }) => {
    await page.goto('/');
    const pricing = page.getByText(/free/i).first();
    await expect(pricing).toBeVisible();
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy.html');
    await expect(page.getByText(/privacy/i).first()).toBeVisible();
  });

  test('support page loads', async ({ page }) => {
    await page.goto('/support.html');
    await expect(page.getByText(/support/i).first()).toBeVisible();
  });
});
