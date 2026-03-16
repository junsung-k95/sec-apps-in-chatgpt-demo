# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Samsung Galaxy Services MCP Server — an MCP (Model Context Protocol) server built for ChatGPT's Apps SDK. It exposes Samsung Galaxy services (promotions, Galaxy Club subscriptions, device trade-in) as MCP tools with rich UI widgets rendered inside ChatGPT.

## Build & Run Commands

All commands run from `samsung-galaxy-mcp/server/`:

```bash
cd samsung-galaxy-mcp/server
npm install          # install dependencies
npm run build        # compile TypeScript (tsc)
node dist/index.js   # start server
```

Server listens on `http://localhost:8787/mcp` (configurable via `PORT` env var).

### HTTPS Tunneling (ngrok)

ChatGPT requires an HTTPS endpoint. Use ngrok to expose the local server:

```bash
ngrok http 8787
```

After starting ngrok, update `WIDGET_DOMAIN` in `src/index.ts` to the generated `https://*.ngrok-free.dev` URL, then rebuild and restart the server.

## Architecture

### Server (`samsung-galaxy-mcp/server/`)

- **`src/index.ts`** — Main entry point. Creates the MCP server, registers all tools and UI resources, and sets up the HTTP server with CORS and Streamable HTTP transport. Each incoming request creates a fresh `McpServer` + `StreamableHTTPServerTransport` (stateless per-request pattern, no session persistence).

- **`src/widgets/`** — Three widget files (`promotionsWidget.ts`, `galaxyClubWidget.ts`, `tradeinWidget.ts`), each exporting a function that returns a complete HTML string. These are registered as `ui://` resources and rendered as iframes in ChatGPT. Widgets communicate with the host via `window.parent.postMessage` (MCP Apps UI protocol) and also support ChatGPT's `openai:set_globals` event for receiving `toolOutput`.

- **`src/data/`** — Static JSON mock data (`devices.json`, `plans.json`, `promotions.json`) used by tools instead of a real backend.

### Key Patterns

- Tools are registered via `registerAppTool` and resources via `registerAppResource` from `@modelcontextprotocol/ext-apps/server`. Each tool returns both `content` (text for the LLM) and `structuredContent` (JSON consumed by widgets).
- Widget-tool binding: tools include `_meta.ui.resourceUri` pointing to a `ui://widget/*.html` resource, plus `_meta["openai/outputTemplate"]` for ChatGPT rendering.
- Trade-in appraisals use an in-memory `Map<string, any>` store (`appraisalStore`) — data does not persist across restarts.
- `WIDGET_DOMAIN` and `WIDGET_CSP` in `index.ts` control the Content Security Policy for widget iframes — update these when changing the deployment domain.

### MCP Tools

| Tool | Purpose | Read-only |
|------|---------|-----------|
| `get_promotions` | Filter/list promotions by category | Yes |
| `get_galaxy_club_info` | Galaxy Club subscription plans & FAQ | Yes |
| `start_tradein_appraisal` | Create trade-in valuation (writes to appraisalStore) | No |
| `submit_tradein_images` | Attach device photos to appraisal | No |
| `get_tradein_result` | Retrieve appraisal status/value | Yes |
| `list_tradein_devices` | List all trade-in eligible devices | Yes |

### References (`references/`)

Contains documentation on the OpenAI Apps SDK (`apps-sdk-*` files) and MCP integration patterns (`building-mcp-for-chatgpt.md`). Consult these when modifying tool registration, widget communication, or deployment configuration.

## Tech Stack

- TypeScript (ES2022, NodeNext modules) with `"type": "module"` in package.json
- `@modelcontextprotocol/sdk` + `@modelcontextprotocol/ext-apps` for MCP server and Apps SDK extensions
- `zod` for tool input schema validation
- Node.js built-in `http` module (no Express)
- JSON imports use `with { type: "json" }` syntax
