# Morgenruf E2E Tests

[![E2E Tests](https://github.com/morgenruf/e2e-tests/actions/workflows/e2e.yml/badge.svg)](https://github.com/morgenruf/e2e-tests/actions/workflows/e2e.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Playwright end-to-end tests for [Morgenruf](https://morgenruf.dev).

## Test Suites

| File | Target | Coverage |
|---|---|---|
| `healthz.spec.ts` | `api.morgenruf.dev` | API health check |
| `api.spec.ts` | `api.morgenruf.dev` | REST API response times, security |
| `api-full.spec.ts` | `api.morgenruf.dev` | Comprehensive API: schema validation, Slack endpoint security, 404 handling |
| `mcp.spec.ts` | `api.morgenruf.dev` | MCP endpoint (auth, tools list, tool calls) |
| `website.spec.ts` | `morgenruf.dev` | Basic website smoke tests |
| `website-full.spec.ts` | `morgenruf.dev` | Full UI: hero, CTA, features, mobile responsiveness, privacy/support pages, link audit |
| `docs-full.spec.ts` | `docs.morgenruf.dev` | All doc pages: getting-started, configuration, self-hosting, helm, MCP, FAQ |
| `status-page.spec.ts` | `status.morgenruf.dev` | Basic status page smoke tests |
| `status-full.spec.ts` | `status.morgenruf.dev` | Full status UI: service cards, `status.json` schema, uptime bars, freshness |
| `dashboard.spec.ts` | `api.morgenruf.dev` | Basic dashboard auth, OAuth flow, public feed |
| `dashboard-full.spec.ts` | `api.morgenruf.dev` | Full dashboard: login redirect, OAuth, MCP auth flows, key-gated tests |

## Run locally

```bash
npm install
npx playwright install chromium

# All tests
npm test

# Smoke tests only (healthz + API — fast)
npm run test:smoke

# API tests
npm run test:api

# Website tests
npm run test:website

# Docs tests
npm run test:docs

# Dashboard tests
npm run test:dashboard

# Status page tests
npm run test:status

# With UI mode (debug / step-through)
npm run test:ui

# Against local dev server
BASE_URL=http://localhost:3000 npm test
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BASE_URL` | No | Override API base URL. Default: `https://api.morgenruf.dev` |
| `MCP_TEST_KEY` | No | MCP API key — enables authenticated MCP tool-call tests |

## CI Schedule

| Job | Trigger | Suites |
|---|---|---|
| **Smoke** | Every push to `main` | `healthz` + `api-full` |
| **Full** | Every 6 hours + `workflow_dispatch` | All suites |

Results are uploaded as artifacts (`playwright-report-<run_number>`) and retained for 30 days.

### Manual trigger

Go to **Actions → E2E Tests → Run workflow** and choose a suite:
`all` · `api` · `website` · `docs` · `dashboard` · `status` · `smoke`

### Secrets

Add `MCP_TEST_KEY` as a GitHub Actions secret to enable MCP authenticated tests.
