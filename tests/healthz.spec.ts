import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('GET /healthz returns ok', async ({ request }) => {
    const res = await request.get('/healthz');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(typeof body.jobs).toBe('number');
    expect(body.jobs).toBeGreaterThan(0);
  });
});
