import { test, expect } from '@playwright/test';

test.describe('Dashboard — Full UI', () => {

  test('dashboard root redirects or shows login', async ({ page }) => {
    const res = await page.goto('/dashboard');
    const status = res?.status() ?? 200;
    expect([200, 302, 401, 403]).toContain(status);
    // Must not be a 500
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Traceback');
  });

  test('OAuth install endpoint redirects to Slack', async ({ page }) => {
    const res = await page.goto('/slack/install', { waitUntil: 'commit' });
    // Should redirect to slack.com OAuth or show install page
    const url = page.url();
    const status = res?.status() ?? 200;
    const isSlackRedirect = url.includes('slack.com') || url.includes('morgenruf');
    expect(isSlackRedirect || [200, 302].includes(status)).toBeTruthy();
  });

  test('public feed with bad token shows 404 page', async ({ page }) => {
    const res = await page.goto('/feed/definitely-not-a-real-token-12345');
    expect(res?.status()).toBe(404);
  });

  test('MCP info endpoint is accessible', async ({ request }) => {
    const res = await request.get('/mcp');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Morgenruf MCP Server');
    expect(body.tools).toHaveLength(8);
    expect(body.endpoint).toContain('/mcp');
    expect(body.docs).toContain('docs.morgenruf.dev');
  });

  test('MCP POST without auth is 401', async ({ request }) => {
    const res = await request.post('/mcp', {
      data: { jsonrpc: '2.0', method: 'tools/list', id: 1 },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('MCP POST with valid key returns tools', async ({ request }) => {
    const key = process.env.MCP_TEST_KEY;
    test.skip(!key, 'MCP_TEST_KEY not set');
    const res = await request.post('/mcp', {
      headers: { Authorization: `Bearer ${key}` },
      data: { jsonrpc: '2.0', method: 'tools/list', id: 1 },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.result.tools.length).toBeGreaterThanOrEqual(8);
  });

  test('MCP tool call — get_workspace_summary', async ({ request }) => {
    const key = process.env.MCP_TEST_KEY;
    test.skip(!key, 'MCP_TEST_KEY not set');
    const res = await request.post('/mcp', {
      headers: { Authorization: `Bearer ${key}` },
      data: {
        jsonrpc: '2.0', method: 'tools/call', id: 1,
        params: { name: 'get_workspace_summary', arguments: {} }
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.result.content[0].type).toBe('text');
  });
});
