import { test, expect } from '@playwright/test';

test.describe('REST API', () => {
  test('GET /healthz is fast (< 2s)', async ({ request }) => {
    const start = Date.now();
    const res = await request.get('/healthz');
    const elapsed = Date.now() - start;
    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(2000);
  });

  test('GET /mcp responds in < 1s', async ({ request }) => {
    const start = Date.now();
    const res = await request.get('/mcp');
    const elapsed = Date.now() - start;
    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(1000);
  });

  test('slack events endpoint rejects unsigned requests', async ({ request }) => {
    const res = await request.post('/slack/events', {
      data: { type: 'url_verification', challenge: 'test' },
      headers: { 'Content-Type': 'application/json' }
    });
    // Should reject (401/403) unsigned Slack requests
    expect([401, 403, 400]).toContain(res.status());
  });
});
