# Morgenruf E2E Tests

Playwright end-to-end tests for [Morgenruf](https://morgenruf.dev).

## What's tested

| Test Suite | Coverage |
|---|---|
| `healthz.spec.ts` | API health check |
| `mcp.spec.ts` | MCP endpoint (auth, tools list, tool calls) |
| `website.spec.ts` | morgenruf.dev pages |
| `status-page.spec.ts` | status.morgenruf.dev |
| `dashboard.spec.ts` | Dashboard auth, OAuth flow, public feed |
| `api.spec.ts` | REST API response times, security |

## Run locally

```bash
npm install
npx playwright install chromium

# All tests
npm test

# API tests only (no browser needed)
npm run test:api

# With UI mode (debug)
npm run test:ui

# Against local dev server
BASE_URL=http://localhost:3000 npm test
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `BASE_URL` | No | Default: `https://api.morgenruf.dev` |
| `MCP_TEST_KEY` | No | MCP API key for authenticated tests |

## CI

Tests run automatically every 6 hours via GitHub Actions. Results uploaded as artifacts.
Add `MCP_TEST_KEY` as a GitHub Actions secret to enable MCP authenticated tests.
