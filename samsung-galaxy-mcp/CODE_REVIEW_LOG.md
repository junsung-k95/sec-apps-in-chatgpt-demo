# 정적 코드리뷰 로그

> 실사용(E2E) 테스트와 별도로, 코드 레벨에서 수행한 정적 리뷰 기록.

---

## 리뷰 방법론

### 1. 요구사항 대조 검증
- `widget-ux-improvements.md`의 각 항목별 요구사항을 체크리스트로 분해
- 해당 코드가 존재하는지, 요구사항을 충족하는지 1:1 대조
- 예: "플랜 카드 클릭 시 `.selected` CSS 클래스 토글" → CSS 정의 확인 + `onclick` 핸들러 확인 + 클래스 적용 로직 확인

### 2. 함수 호출 체인 추적
- 위젯 버튼 `onclick` → JS 함수 → `rpcRequest` / `postMessage` 순서로 호출 체인 추적
- 인자가 올바르게 전달되는지 확인 (예: `plan_type`이 도구 스키마의 required 필드인데 누락되지 않았는지)
- fallback 경로 (try/catch → `ui/message`) 존재 여부 확인

### 3. 프로토콜 준수 확인
- `ui/initialize` → 응답 대기 → `ui/notifications/initialized` 3단계 핸드셰이크
- `tools/call` 요청 시 `{ name, arguments }` 형식 준수
- `ui/update-model-context` 요청 시 `{ content: [{ type, text }] }` 형식 준수
- 메시지 리스너에서 RPC 응답(id 기반)과 알림(method 기반) 분기 처리

### 4. CSS/UI 일관성 검증
- CSS 변수(`--samsung-blue` 등) 사용 여부 — 하드코딩 색상이 다크모드에서 깨지는지
- `@media (prefers-color-scheme: dark)` 블록에서 모든 하드코딩 색상이 오버라이드되는지
- 스켈레톤 로딩 HTML이 실제 레이아웃과 유사한 구조인지
- 애니메이션 `@keyframes` 정의 + `animation-delay` 순차 적용 확인

### 5. 스코프/구문 분석
- 함수가 올바른 스코프에 정의되어 있는지 (중첩 함수 문제)
- 변수 참조가 유효한지 (예: `selectedPlanId`가 선언된 스코프에서 접근 가능한지)
- 템플릿 리터럴 내 이스케이프 (`\\'`) 처리

### 6. 데이터 정합성
- 도구의 Zod 스키마(required/optional 필드)와 위젯에서 전달하는 인자 매칭
- `structuredContent` 반환 필드와 위젯 렌더러가 참조하는 필드명 일치 여부
- JSON 데이터 파일의 구조 변경 시 도구 코드가 새 구조를 올바르게 참조하는지

### 미포함 범위
- 실제 ChatGPT 환경에서의 위젯 렌더링
- `tools/call`, `ui/initialize` 등 Apps SDK 프로토콜의 런타임 동작
- 네트워크/ngrok 환경에서의 CSP/CORS 동작
- 사용자 인터랙션 (터치, 스크롤, 반응형 레이아웃)

---

## 리뷰 1차 — 2026-03-16 (최초 완료 항목)

### 대상
`widget-ux-improvements.md`에서 `[x] 완료`로 표시된 4개 항목

### 결과

| 항목 | 파일 | 결과 | 비고 |
|------|------|------|------|
| 0-1. Trade-in 이미지 업로드 UI 제거 | index.ts | ✅ Pass | `openai/fileParams` 줄 삭제 확인 |
| 0-2. Trade-in 도구 영어 텍스트 한글화 | index.ts | ⚠️ Partial → 수정 완료 | `get_tradein_result`만 한글화, 나머지 6건 영어 잔존 발견 → 즉시 수정 |
| C-2. Trade-in 상태/용량 칩 UI | tradeinWidget.ts | ✅ Pass | 칩 선택 + 가격 즉시 반영 + 조건별 색상 |
| E-4. 로딩 스켈레톤 UI | 4개 위젯 | ✅ Pass | `@keyframes shimmer` + 위젯별 스켈레톤 HTML |

### 수정 사항 (0-2 영어 잔존)
- `start_tradein_appraisal` content.text 한글화
- `start_tradein_appraisal` next_step 한글화
- `start_tradein_appraisal` device_not_found 에러 한글화
- `submit_tradein_images` content.text 한글화
- `get_tradein_result` appraisal_not_found 한글화
- `get_tradein_result` content.text (제목/필드명) 한글화
- `analyze_tradein_device` appraisal_not_found 한글화

---

## 리뷰 2차 — 2026-03-16 (신규 완료 항목 8건)

### 대상
이전 리뷰 이후 `[x] 완료`로 변경된 항목들

### 결과

| 항목 | 파일 | 결과 | 비고 |
|------|------|------|------|
| 0-3. Trade-in 기기 검색 (`tools/call`) | tradeinWidget.ts, index.ts | ✅ Pass | 검색 입력 + `rpcRequest("tools/call")` + `ui/initialize` 핸드셰이크. region 하드코딩(`KR`)은 제품 결정 사항 |
| 0-4. Galaxy Club 기기 드롭다운 | galaxyClubWidget.ts, index.ts | ⚠️ → 수정 완료 | `<select>` 드롭다운 존재, `tools/call` 호출 존재. **`plan_type` 인자 누락** 발견 → Zod 검증 실패 가능 → 수정 |
| A-1. Care+ 플랜 선택 인터랙션 | carePlusWidget.ts | ⚠️ → 수정 완료 | `.selected` CSS + CTA 동적 변경 구현됨. **RPC 브릿지 누락** → `ui/update-model-context` 미호출 → 브릿지 + 호출 추가 |
| B-1. Galaxy Club 플랜 탭 UI | galaxyClubWidget.ts | ✅ Pass | `.plan-tabs` + `switchTab` + `buildPlanCard` 분리 + fadeIn 애니메이션 |
| B-4. 타임라인 애니메이션 | galaxyClubWidget.ts | ✅ Pass | `fadeSlideUp` + nth-child delay (0.1s~0.9s) |
| C-4. 견적 수락 확인 UI | tradeinWidget.ts | ✅ Pass | `.confirm-overlay` + 금액 표시 + 확인/취소 버튼 |
| D-1. 비교 위젯 기간 슬라이더 | comparisonWidget.ts | ⚠️ → 수정 완료 | 슬라이더 존재 + 실시간 재계산. **30개월 불필요 스텝** → 인덱스 방식으로 변경 (12/18/24/36만). **savings 계산 필드 오류** → `outright.care_plus_cost` 우선 사용으로 수정 |
| E-1. `ui/initialize` 프로토콜 | tradeinWidget.ts, galaxyClubWidget.ts | ✅ Pass | 2개 위젯에 3단계 핸드셰이크 구현 |
| E-3. 다크 모드 | 4개 위젯 | ⚠️ → 수정 완료 | CSS variables 오버라이드 존재. comparison 위젯에서 `.tradein-section`, `.col-badge`, `.benefit-tag` **하드코딩 색상 미오버라이드** → 추가 |
| E-2. 위젯 상태 유지 | 4개 위젯 | ✅ Pass | `setWidgetState` 저장 + `widgetState` 복원 |
| E-5. 에러 상태 개선 | 4개 위젯 | ✅ Pass | 아이콘 + 제목 + 설명 + 다시 시도 버튼 |
| index.ts `_meta.ui.visibility` | index.ts | ✅ Pass | `search_tradein_value`, `compare_galaxy_club_cost` 모두 `["model", "app"]` 설정 |

### 발견 및 수정한 버그

| # | 위치 | 심각도 | 내용 | 수정 |
|---|------|--------|------|------|
| 1 | galaxyClubWidget.ts:715 | Critical | `renderGalaxyClub` 함수 닫는 `}` 누락 → `buildPlanCard`가 내부에 중첩되어 `switchTab`에서 호출 시 스코프 문제 | 닫는 중괄호 추가 |
| 2 | galaxyClubWidget.ts:756 (compareWithDevice) | Critical | `tools/call` 호출 시 `plan_type` 인자 누락 → Zod enum 검증 실패 | `compareCost`에서 `planId` 전달, `plan_type` 인자 추가 |
| 3 | carePlusWidget.ts | Major | RPC 브릿지(`rpcRequest`, `pendingRequests`) 미구현 → `ui/update-model-context` 호출 불가 | RPC 브릿지 + 메시지 리스너 응답 핸들러 추가 |
| 4 | comparisonWidget.ts:461 | Minor | 슬라이더 `step="6"` + `max="36"` → 30개월 스텝 허용 (스펙 외) | 인덱스 방식(`PERIOD_OPTIONS = [12,18,24,36]`)으로 변경 |
| 5 | comparisonWidget.ts:443 | Minor | savings 계산 시 `club.care_plus_value` 사용 → `outright.care_plus_cost`와 불일치 가능 | `outright.care_plus_cost` 우선 사용 |
| 6 | comparisonWidget.ts:22-31 | Minor | 다크모드에서 `.tradein-section` 등 하드코딩 밝은 색상 미오버라이드 | 다크모드 블록에 추가 |

---

## 통합 테스트 — MCP 서버 (ChatGPT 미연동)

### 테스트 코드
```
server/test/mcp-server.test.mjs
```

### 실행 방법
```bash
cd samsung-galaxy-mcp/server

# 1. 빌드
npx -p typescript tsc

# 2. 서버 시작 (별도 터미널)
node dist/index.js

# 3. 테스트 실행
node test/mcp-server.test.mjs
```

### 테스트 범위 (28건)

| 카테고리 | 테스트 | 건수 |
|----------|--------|------|
| Health Check | GET / 200 OK | 1 |
| MCP Initialize | 서버 정보 반환 | 1 |
| Tools List | 등록된 도구 전체 확인 | 1 |
| Resources List | 위젯 리소스 4개 확인 | 1 |
| get_service_guidelines | 가이드라인 구조 검증 | 1 |
| get_galaxy_club_info | 전체/필터/추천 로직 | 3 |
| get_care_plus_info | 플랜 반환, 즉시/late/만료 판정 | 4 |
| check_care_plus_eligibility | 양호 승인, 불량 거절 | 2 |
| search_tradein_value | 검색, 지역 보정, 미존재 기기 | 3 |
| start_tradein_appraisal | 생성, 미존재 에러, 지역/통신사 보정 | 3 |
| get_tradein_result | ID 조회, 미존재 에러 | 2 |
| analyze_tradein_device | Vision 재산정 before/after | 1 |
| compare_galaxy_club_cost | 비용 비교, Trade-in 포함 | 2 |
| 한글화 검증 | next_steps/CTA/content 한국어 확인 | 3 |

### 최초 실행 결과 (2026-03-16)
```
📊 결과: 28 passed, 0 failed (총 28건)
```

### 테스트 실패 시 대응 가이드

| 증상 | 원인 | 해결 |
|------|------|------|
| `fetch failed` / `ECONNREFUSED` | 서버 미실행 | `node dist/index.js` 실행 후 재시도 |
| `Missing tool: xxx` | 도구명 변경 또는 제거됨 | `test/mcp-server.test.mjs`의 `expected` 배열을 현재 도구 목록에 맞게 수정 |
| `Missing resource: xxx` | 위젯 리소스 URI 변경 | `expected` 배열의 URI를 현재 `index.ts`의 `registerAppResource` URI와 일치시킴 |
| `Expected eligible_immediate` 등 판정 실패 | `care_plus.json`의 `standard_window_days` 또는 `max_days_after_purchase` 값 변경 | 테스트의 날짜 계산(30일/150일/400일)을 데이터에 맞게 조정 |
| `KR price should be lower than US` | `devices.json`의 `region_multipliers.KR.multiplier` 변경 | 테스트의 비교 로직을 새 multiplier에 맞게 수정 |
| `Expected device_not_found` | `devices.json`에 해당 기기가 추가됨 | 테스트의 미존재 기기명을 실제로 없는 이름으로 변경 |
| `Content text should be Korean` | 도구의 content.text가 다시 영어로 변경됨 | `index.ts`의 해당 도구 content.text를 한글로 수정 |
| structuredContent 필드 누락 | 도구 반환값 구조 변경 | 테스트의 assert를 현재 반환 구조에 맞게 수정 |
