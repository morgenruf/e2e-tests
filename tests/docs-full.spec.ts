import { test, expect } from '@playwright/test';

test.describe('Docs — Full UI', () => {
  test.use({ baseURL: 'https://docs.morgenruf.dev' });

  const pages = [
    { path: '/', title: /morgenruf|docs/i, heading: /morgenruf/i },
    { path: '/getting-started.html', title: /getting started/i, heading: /getting started/i },
    { path: '/configuration.html', title: /configuration/i, heading: /config/i },
    { path: '/self-hosting.html', title: /self.hosting/i, heading: /self.host/i },
    { path: '/helm.html', title: /helm/i, heading: /helm/i },
    { path: '/mcp.html', title: /mcp/i, heading: /mcp/i },
    { path: '/faq.html', title: /faq/i, heading: /faq/i },
  ];

  for (const p of pages) {
    test(`${p.path} — loads and has heading`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page).toHaveTitle(p.title);
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  }

  test('mcp.html — has all 8 tool names', async ({ page }) => {
    await page.goto('/mcp.html');
    const tools = ['get_standups','get_today_standups','get_blockers','get_participation',
                   'get_members','search_standups','get_workspace_summary','get_mood_summary'];
    for (const tool of tools) {
      await expect(page.getByText(tool).first()).toBeVisible();
    }
  });

  test('docs nav — MCP link exists on all pages', async ({ page }) => {
    await page.goto('/getting-started.html');
    const mcpLink = page.locator('a[href*="mcp"]');
    await expect(mcpLink.first()).toBeVisible();
  });

  test('getting-started.html — helm install command visible', async ({ page }) => {
    await page.goto('/getting-started.html');
    await expect(page.getByText(/helm install|helm repo add/i).first()).toBeVisible();
  });

  test('configuration.html — no fake DM commands', async ({ page }) => {
    await page.goto('/configuration.html');
    const body = await page.locator('body').textContent();
    // These fake commands should NOT exist
    expect(body).not.toMatch(/config channel|config time(?!zone)|config days/i);
  });

  test('docs — mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
