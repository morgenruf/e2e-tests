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

  test('healthz — response time < 500ms', async ({ request }) => {
    const start = Date.now();
    await request.get('/healthz');
    expect(Date.now() - start).toBeLessThan(500);
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

  test('nonexistent route returns 404', async ({ request }) => {
    const res = await request.get('/this-does-not-exist-at-all');
    expect(res.status()).toBe(404);
  });

  test('dashboard API without session returns 401/302', async ({ request }) => {
    const res = await request.get('/dashboard/api/standups', { maxRedirects: 0 });
    expect([302, 401, 403]).toContain(res.status());
  });
});
