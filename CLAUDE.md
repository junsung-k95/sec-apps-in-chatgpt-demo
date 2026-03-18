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

## Documentation Guide

프로젝트 내 `.md` 파일 목록과 각각의 목적, 상황별 참고 가이드입니다.

### 프로젝트 문서 (`samsung-galaxy-mcp/`)

| 파일 | 목적 | 언제 참고? |
|------|------|-----------|
| `DEMO_SCENARIOS.md` | 과장님 데모용 3개 시나리오 (Care+ Late Enrollment, Galaxy Club 상담, Trade-in 카메라 견적). 턴별 대화 흐름과 위젯 동작 정의. | 데모 준비, 대화 흐름 확인, 시나리오 기반 테스트 시 |
| `DEMO_SCENARIOS_FOR_CLAUDE.md` | Playwright MCP 도구를 사용한 ChatGPT 자동화 테스트 가이드. 사전 조건, 테스트 절차 포함. | Claude Code로 E2E 테스트 자동화 시 |
| `DATA_SPEC.md` | 4개 데이터 파일(devices, promotions, plans, care_plus)의 스키마, 필드 설명, ERD, Trade-in 가격 산출 공식, 데모 시나리오별 데이터 매핑. | 데이터 구조 파악, 새 기기/프로모션 추가, 가격 계산 로직 이해, 발표 자료 준비 시 |
| `widget-ux-improvements.md` | 위젯 UX 개선 TODO 목록. Must/Should/Nice 우선순위, 구현 가이드, 완료 상태 추적. | 위젯 기능 추가/수정, 작업 분배, 진행 상황 확인 시 |
| `CODE_REVIEW_LOG.md` | 정적 코드 리뷰 기록. E2E 테스트와 별도로 코드 레벨 이슈 추적. | 코드 품질 점검, 알려진 이슈 확인 시 |
| `DEMO_TEST_LOG.md` | ChatGPT에서 실제 데모 테스트한 결과 로그. 날짜, 환경, 발견된 문제 기록. | 테스트 이력 확인, 재현 가능한 버그 추적 시 |

### SDK 레퍼런스 (`references/`)

| 파일 | 목적 | 언제 참고? |
|------|------|-----------|
| `apps-sdk-quickstart.md` | Apps SDK 빠른 시작 가이드. `ui/initialize`, `rpcRequest`, `tools/call` 구현 패턴 포함. | 위젯에서 `tools/call` 연동, RPC 브릿지 구현 시 |
| `apps-sdk-cores-1~3.md` | MCP 핵심 개념 (tools, resources, transport). 프로토콜 기초. | MCP 프로토콜 이해, 새 tool/resource 설계 시 |
| `apps-sdk-build-1~4.md` | MCP 서버 구축 가이드. tool 등록, widget resource 등록, `_meta.ui.visibility` 설정. | 새 도구 추가, tool visibility 설정, 위젯-도구 바인딩 수정 시 |
| `apps-sdk-plan-1.md` | Apps SDK 로드맵/계획. | SDK 향후 방향 파악 시 |
| `building-mcp-for-chatgpt.md` | ChatGPT용 MCP 서버 구축 종합 가이드. bridge method 매핑, CSP 설정, 배포 설정. | ChatGPT 연동 문제 해결, CORS/CSP 설정, 배포 구성 변경 시 |

### 루트 레벨

| 파일 | 목적 | 언제 참고? |
|------|------|-----------|
| `CLAUDE.md` (이 파일) | Claude Code 작업 가이드라인. 빌드 명령, 아키텍처, 코딩 규칙. | 항상 (Claude Code가 자동으로 참조) |

### 상황별 빠른 참조

- **"새 기기/프로모션을 데이터에 추가하고 싶다"** → `DATA_SPEC.md`
- **"데모 시나리오 대화 흐름을 확인하고 싶다"** → `DEMO_SCENARIOS.md`
- **"위젯에 새 기능을 추가하고 싶다"** → `widget-ux-improvements.md` + `apps-sdk-quickstart.md`
- **"tools/call이나 ui/initialize를 구현하고 싶다"** → `apps-sdk-quickstart.md` + `apps-sdk-build-2.md`
- **"ChatGPT 연동이 안 된다 (CORS, CSP)"** → `building-mcp-for-chatgpt.md`
- **"새 MCP tool을 만들고 싶다"** → `apps-sdk-build-1.md` + `apps-sdk-cores-1.md`
- **"Playwright로 자동 테스트하고 싶다"** → `DEMO_SCENARIOS_FOR_CLAUDE.md`

## Tech Stack

- TypeScript (ES2022, NodeNext modules) with `"type": "module"` in package.json
- `@modelcontextprotocol/sdk` + `@modelcontextprotocol/ext-apps` for MCP server and Apps SDK extensions
- `zod` for tool input schema validation
- Node.js built-in `http` module (no Express)
- JSON imports use `with { type: "json" }` syntax
