import { test, expect } from '@playwright/test';

test.describe('API — Comprehensive', () => {

  test('healthz — returns valid schema', async ({ request }) => {
    const res = await request.get('/healthz');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: 'ok' });
    expect(typeof body.jobs).toBe('number');
    expect(body.jobs).toBeGreaterThanOrEqual(3);
  });

  test('healthz response time < 1500ms and dependencies up', async ({ request }) => {
    // /healthz also checks the database, so allow headroom for a slow query.
    const start = Date.now();
    const res = await request.get('/healthz');
    expect(Date.now() - start).toBeLessThan(1500);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.db).toBe(true);
    expect(body.scheduler).toBe(true);
  });

  test('mcp info — full schema validation', async ({ request }) => {
    const res = await request.get('/mcp');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('name', 'Morgenruf MCP Server');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('endpoint');
    expect(body).toHaveProperty('auth');
    expect(body).toHaveProperty('docs');
    expect(Array.isArray(body.tools)).toBeTruthy();
    const expectedTools = ['get_standups','get_blockers','get_participation','get_members',
                           'search_standups','get_workspace_summary','get_mood_summary','get_today_standups'];
    for (const tool of expectedTools) {
      expect(body.tools).toContain(tool);
    }
  });

  test('slack events — missing signature returns 403', async ({ request }) => {
    const res = await request.post('/slack/events', {
      data: { type: 'url_verification', challenge: 'abc' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test('slack interactions — missing signature returns 403', async ({ request }) => {
    const res = await request.post('/slack/interactions', {
      data: 'payload={}',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test('nonexistent API routes return 404', async ({ request }) => {
    // Backend namespaces still 404. Other unknown paths are served by the
    // React frontend with 200, so the page check below covers those.
    for (const path of ['/api/does-not-exist', '/dashboard/api/does-not-exist']) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(404);
    }
  });

  test('nonexistent page renders not-found view', async ({ page }) => {
    await page.goto('/this-does-not-exist-at-all');
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('dashboard API without session returns 401/302', async ({ request }) => {
    const res = await request.get('/dashboard/api/standups', { maxRedirects: 0 });
    expect([302, 401, 403]).toContain(res.status());
  });
});
