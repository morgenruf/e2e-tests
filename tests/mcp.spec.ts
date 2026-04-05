import { test, expect } from '@playwright/test';

test.describe('MCP Endpoint', () => {
  test('GET /mcp returns server info', async ({ request }) => {
    const res = await request.get('/mcp');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Morgenruf MCP Server');
    expect(Array.isArray(body.tools)).toBeTruthy();
    expect(body.tools.length).toBeGreaterThanOrEqual(8);
  });

  test('POST /mcp without auth returns 401', async ({ request }) => {
    const res = await request.post('/mcp', {
      data: { jsonrpc: '2.0', method: 'tools/list', id: 1 }
    });
    expect(res.status()).toBe(401);
  });

  test('POST /mcp initialize with valid key', async ({ request }) => {
    const apiKey = process.env.MCP_TEST_KEY;
    test.skip(!apiKey, 'MCP_TEST_KEY not set');
    const res = await request.post('/mcp', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      data: { jsonrpc: '2.0', method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {} }, id: 1 }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.result.serverInfo.name).toBe('morgenruf');
  });

  test('POST /mcp tools/list returns 8 tools', async ({ request }) => {
    const apiKey = process.env.MCP_TEST_KEY;
    test.skip(!apiKey, 'MCP_TEST_KEY not set');
    const res = await request.post('/mcp', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      data: { jsonrpc: '2.0', method: 'tools/list', id: 1 }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.result.tools.length).toBeGreaterThanOrEqual(8);
    const names = body.result.tools.map((t: any) => t.name);
    expect(names).toContain('get_standups');
    expect(names).toContain('get_blockers');
    expect(names).toContain('get_participation');
  });
});
