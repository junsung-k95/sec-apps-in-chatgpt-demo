# 위젯 UX 개선 TODO

> 현재 모든 위젯 버튼이 `ui/message`(채팅 텍스트 전송)만 사용.
> Apps SDK가 지원하는 `tools/call`, `ui/update-model-context`, 폼 입력, 외부 링크, 상태 관리 등을 활용하여 데모 임팩트를 높인다.

---

## 🔴 Must — 즉시 수정 (데모 블로커 / 구현 간단)

### 0-1. Trade-in 이미지 업로드 UI 제거
- [x] **완료**
- **현재 문제:** `submit_tradein_images` 도구에 `"openai/fileParams": ["front_image", "back_image", "screen_image", "damage_image"]`가 설정되어 있어, ChatGPT가 Front/Back/Screen/Damage 4칸 업로드 그리드를 자동 렌더링함. 시나리오상 사진은 대화창에서 직접 업로드 → LLM Vision이 분석하는 흐름이므로, 이 별도 업로드 UI는 불필요하고 사용자에게 혼란을 줌.
- **해결:** `src/index.ts`의 `submit_tradein_images` 도구 `_meta`에서 `"openai/fileParams"` 줄 삭제
- **대상 파일:** `src/index.ts:470`
- **구현:**
  ```diff
  _meta: {
    ui: { resourceUri: "ui://widget/tradein.html" },
    "openai/outputTemplate": "ui://widget/tradein.html",
  - "openai/fileParams": ["front_image", "back_image", "screen_image", "damage_image"],
  },
  ```

---

### 0-2. Trade-in 도구 영어 텍스트 한글화
- [x] **완료**
- **현재 문제:** `get_tradein_result` 도구가 반환하는 `next_steps` 배열과 `cta.text`가 영어. 위젯에 표시되는 "다음 단계"와 CTA 버튼 텍스트가 영어로 나옴.
- **해결:** 해당 문자열을 한글로 변경
- **대상 파일:** `src/index.ts:569-578, 596`
- **구현:**
  ```
  // next_steps (완료 시)
  "보상판매 제안을 수락하세요",
  "무료 선불 라벨로 기기를 발송하세요",
  "3~5 영업일 내 크레딧을 받으세요",

  // next_steps (미완료 시)
  "기기 사진을 업로드하세요 (앞면/뒷면 필수)",
  "이미지 분석이 완료될 때까지 기다려주세요",
  "최종 견적을 확인하고 수락하세요",

  // cta.text
  완료: "보상판매 제안 수락" / 미완료: "기기 사진 업로드"
  ```

---

### 0-3. Trade-in 기기 검색 입력 (`tools/call` 활용)
- [x] **완료**
- **현재 문제:** Trade-in 위젯에 사용자가 직접 입력할 수 있는 요소가 전혀 없음. 기기 모델을 알아보려면 채팅으로 돌아가야 함.
- **해결:** 위젯 상단에 텍스트 입력 + 검색 버튼 추가. 사용자가 기기명 입력 → `tools/call`로 `search_tradein_value` 도구를 위젯 내에서 직접 호출 → 결과를 위젯에서 바로 렌더링.
- **대상 파일:** `src/widgets/tradeinWidget.ts`, `src/index.ts`
- **구현 가이드:**
  1. `tradeinWidget.ts`에 `<input type="text" placeholder="기기 모델명 검색 (예: Galaxy S24)">` + `<button>검색</button>` 추가
  2. 검색 버튼 클릭 시 `rpcRequest("tools/call", { name: "search_tradein_value", arguments: { query: inputValue } })` 호출
  3. 응답의 `structuredContent`로 결과 카드를 위젯 내에 렌더링 (모델명, 용량별 예상 가격)
  4. `index.ts`에서 `search_tradein_value` 도구의 `_meta.ui.visibility`를 `["model", "app"]`으로 설정 (위젯에서 호출 가능하도록)
  5. 위젯에 `ui/initialize` 핸드셰이크 로직 추가 (`tools/call` 사용 전제조건)

---

### 0-4. Galaxy Club 기기 선택 드롭다운
- [x] **완료**
- **현재 문제:** Galaxy Club 위젯에 관심 기기를 선택하는 UI가 없음. "비용 비교하기" 버튼은 채팅에 텍스트만 보냄.
- **해결:** 플랜 카드 하단에 기기 선택 `<select>` 드롭다운 추가. 기기 선택 후 "비용 비교" 버튼 클릭 → `tools/call`로 `compare_galaxy_club_cost` 도구 호출.
- **대상 파일:** `src/widgets/galaxyClubWidget.ts`, `src/index.ts`
- **구현 가이드:**
  1. `galaxyClubWidget.ts`에 기기 목록 드롭다운 추가: `<select id="device-select"><option>Galaxy S25 Ultra</option>...`
  2. 기기 목록은 `structuredContent`에 `available_devices` 필드로 서버에서 전달 (또는 하드코딩)
  3. "비용 비교하기" 버튼 클릭 시 기존 `ui/message` 대신 `rpcRequest("tools/call", { name: "compare_galaxy_club_cost", arguments: { device_model: selectedDevice, plan_type: selectedPlan } })` 호출
  4. `index.ts`에서 `compare_galaxy_club_cost` 도구 `_meta.ui.visibility`를 `["model", "app"]`으로 설정
  5. 위젯에 `ui/initialize` 핸드셰이크 로직 추가

---

## 🟡 Should — 데모 임팩트 높음 + 구현 중간

### A-1. Care+ 플랜 선택 인터랙션
- [x] **완료**
- **현재 문제:** Care+ 위젯의 "가입하기" 버튼 클릭 → 채팅에 텍스트 전송만 함. 어떤 플랜을 선택했는지 위젯에서 시각적 피드백 없음.
- **해결:** 플랜 카드 클릭 시 선택 상태 하이라이트(테두리 색 변경) + `ui/update-model-context`로 선택한 플랜 정보를 모델에 알림. 이후 "가입하기" 버튼은 선택된 플랜으로 진행.
- **대상 파일:** `src/widgets/carePlusWidget.ts`
- **구현 가이드:**
  1. 플랜 카드에 `onclick="selectPlan('care-basic')"` 이벤트 추가
  2. 클릭 시 `.plan-col.selected` CSS 클래스 토글 (파란 테두리 + 체크 아이콘)
  3. `rpcRequest("ui/update-model-context", { content: [{ type: "text", text: "사용자가 Care+ Premium 플랜을 선택함" }] })` 호출
  4. 하단 CTA 버튼 텍스트를 선택된 플랜에 따라 동적 변경

---

### C-2. Trade-in 상태/용량 드롭다운
- [x] **완료** — 칩(chip) UI 방식으로 구현. 용량/상태 선택 시 클라이언트 사이드에서 가격 즉시 반영 + "정식 견적 받기" 버튼으로 대화 입력.
- **대상 파일:** `src/widgets/tradeinWidget.ts`

---

### E-4. 로딩 스켈레톤 UI
- [x] **완료**
- **현재 문제:** 모든 위젯이 "...를 불러오는 중" 텍스트만 표시. 시각적으로 밋밋하고 전문성이 떨어져 보임.
- **해결:** 텍스트 대신 회색 박스가 깜빡이는 스켈레톤 애니메이션으로 교체.
- **대상 파일:** 모든 위젯 파일 (`carePlusWidget.ts`, `galaxyClubWidget.ts`, `tradeinWidget.ts`, `comparisonWidget.ts`)
- **구현 가이드:**
  1. 공통 CSS: `.skeleton` 클래스 (배경 `#e0e0e0`, `@keyframes shimmer` 좌→우 그라데이션 이동)
  2. 각 위젯의 로딩 상태 HTML을 실제 레이아웃과 유사한 스켈레톤 박스로 교체
  3. 예: Care+ 위젯 → 헤더 스켈레톤 + 2칸 플랜 카드 스켈레톤 + 버튼 스켈레톤

---

## 🟢 Nice to have — 여유 있을 때

### B-1. Galaxy Club 플랜 비교 토글
- [x] **완료** — 탭 UI로 전환. 추천 플랜 자동 선택, fadeIn 애니메이션으로 전환.
- **설명:** 플랜 3개가 세로로 길게 나열됨 → 탭 UI로 전환하여 한 번에 하나씩 보여주고, 좌우 스와이프 또는 탭 클릭으로 전환.
- **대상 파일:** `src/widgets/galaxyClubWidget.ts`

### B-4. 라이프사이클 타임라인 애니메이션
- [x] **완료**
- **설명:** 타임라인 노드가 정적으로 한 번에 표시됨 → CSS animation으로 순차적 등장 (fade-in + slide-up). 데모 시 시각적 임팩트 증가.
- **대상 파일:** `src/widgets/galaxyClubWidget.ts`

### C-3. Vision 분석 결과 시각화 강화
- [ ] **제외** — ChatGPT Vision이 이미지 분석 → 결과로 견적 조회하는 흐름이 더 적합하므로 위젯 내 시각화는 불필요.
- **대상 파일:** `src/widgets/tradeinWidget.ts`

### C-4. 견적 수락 확인 UI
- [x] **완료** — "견적 수락하기" 클릭 시 금액 확인 패널(수락/취소) 표시 후 진행. 취소 시 원래 뷰로 복원.
- **설명:** "견적 수락하기" 클릭 시 바로 채팅 메시지 전송됨 → 인라인 확인 패널("정말 $322에 수락하시겠습니까? [확인] [취소]") 표시 후 진행.
- **대상 파일:** `src/widgets/tradeinWidget.ts`

### D-1. 비교 위젯 기간 변경 슬라이더
- [x] **완료** — 12~36개월 슬라이더 추가. 기간 변경 시 Galaxy Club 총액과 절약액을 클라이언트 사이드에서 실시간 재계산.
- **설명:** Galaxy Club vs 일시불 비교가 고정 기간 표시 → `<input type="range">`로 12/18/24개월 전환. 슬라이더 조작 시 비용 실시간 재계산 (클라이언트 사이드 계산).
- **대상 파일:** `src/widgets/comparisonWidget.ts`

### E-1. `ui/initialize` 프로토콜 추가
- [x] **완료** — 0-3, 0-4에서 tradeinWidget, galaxyClubWidget에 구현됨
- **설명:** 현재 모든 위젯이 초기화 핸드셰이크 없이 동작. MCP Apps 표준에서 `tools/call`을 사용하려면 `ui/initialize`가 필수. Must 항목(0-3, 0-4)에서 `tools/call`을 도입하면 자연스럽게 함께 구현됨.
- **대상 파일:** 모든 위젯 파일

### E-2. 위젯 상태 유지 (`setWidgetState`)
- [x] **완료** — 4개 위젯 전체. 탭 선택, FAQ 열림/닫힘, 용량/상태 선택, 슬라이더 값 등 유지.
- **설명:** FAQ 열림/닫힘, 선택한 플랜, 드롭다운 값 등이 스크롤 후 돌아오면 초기화됨 → `window.openai.setWidgetState()`로 상태 저장.
- **대상 파일:** 모든 위젯 파일

### E-3. 다크 모드 지원
- [x] **완료** — 4개 위젯 모두 `@media (prefers-color-scheme: dark)` 추가. CSS variables 오버라이드 방식.
- **대상 파일:** 모든 위젯 파일

### E-5. 에러 상태 개선
- [x] **완료** — 4개 위젯 전체. 아이콘 + 제목 + 설명 + 다시 시도 버튼 패턴 적용.
- **설명:** 에러 시 단순 텍스트만 표시 → 아이콘 + 설명 + "다시 시도" 버튼으로 개선.
- **대상 파일:** 모든 위젯 파일

---

## 🔴 코드리뷰에서 발견된 이슈 — 수정 필요

### F-1. Galaxy Club 가입 절차 한글화
- [x] **완료** — `plans.json`의 `enrollment_steps` 5개 항목 title/description 한글화
- **현재 문제:** galaxyClubWidget의 "가입 절차" 섹션에 영어가 표시됨. 원인: `plans.json`의 `enrollment_steps[].description`이 영어.
- **해결:** `src/data/plans.json`의 `enrollment_steps` 5개 항목의 `description` 필드를 아래와 같이 한글로 변경:
  ```
  step 1: "플랜을 선택하세요 (Basic, Premium, Family)"
  step 2: "대상 기기 라인업에서 첫 기기를 선택하세요"
  step 3: "간편 신용 조회 (소프트 풀, 신용 점수에 영향 없음)"
  step 4: "주문 확인 및 월 결제 설정"
  step 5: "2-3 영업일 내 기기 수령, 풀 보장 적용!"
  ```
- **대상 파일:** `src/data/plans.json` — `enrollment_steps[0~4].description`

### F-2. Galaxy Club FAQ 영어 → 한글 번역 (7건)
- [x] **완료** — `plans.json`의 faq-001~007 question/answer 한글 번역
- **현재 문제:** galaxyClubWidget의 "자주 묻는 질문"에서 faq-001~faq-007이 영어로 노출. faq-008~faq-010은 이미 한글.
- **해결:** `src/data/plans.json`의 `faq` 배열에서 아래 7건의 `question`/`answer`를 한글로 변경:
  ```
  faq-001: Q "현재 전화번호를 유지할 수 있나요?" A "네! Galaxy Club은 통신사가 아닌 기기 구독 서비스입니다. 기존 전화번호와 통신사 요금제를 그대로 사용합니다."
  faq-002: Q "업그레이드할 때 기존 기기는 어떻게 되나요?" A "새 기기를 받으실 때 기존 기기를 반납하시면 됩니다. 무료 선불 배송 라벨을 제공하며, 모든 기기는 책임감 있게 리사이클링됩니다."
  faq-003: Q "언제든 해지할 수 있나요?" A "최소 약정 기간(12개월) 이후 해지 가능합니다. 조기 해지 시 위약금이 발생합니다. 기기는 양호한 상태로 반납해야 합니다."
  faq-004: Q "기기를 파손하면 어떻게 되나요?" A "Samsung Care+가 포함되어 있습니다! 경미한 수리는 보장됩니다. 심한 파손의 경우 플랜 등급에 따른 최대 수수료가 적용됩니다."
  faq-005: Q "기기를 매입(바이아웃)해서 소유할 수 있나요?" A "네! 12개월 이후 잔존 가치 기준의 할인된 가격으로 기기를 매입할 수 있습니다. 고객센터에서 바이아웃 가격을 문의하세요."
  faq-006: Q "액세서리도 포함되나요?" A "Premium과 Family 플랜은 업그레이드마다 무료 액세서리 번들($100 가치)이 포함됩니다. Basic 플랜 회원은 전용 할인을 받을 수 있습니다."
  faq-007: Q "주기 종료 전에 업그레이드할 수 있나요?" A "네, 조기 업그레이드는 비례 수수료가 적용됩니다. Premium과 Family 플랜 회원은 6개월 이후 할인된 조기 업그레이드 수수료로 가능합니다."
  ```
- **대상 파일:** `src/data/plans.json` — `faq[0~6]`의 `question`과 `answer`

### F-3. Trade-in 사진 업로드 잔존 코드 정리
- [x] **완료** — photo-hint HTML 제거, CTA 버튼 fallback 텍스트에서 "사진 업로드" 제거
- **대상 파일:** `src/widgets/tradeinWidget.ts`
- **참고:** CSS의 `.photo-hint` 클래스는 미사용 잔존. 동작에 영향 없음.

### F-4. `submit_tradein_images` 도구 제거
- [x] **완료** — registerAppTool 블록 삭제, 서버 배너 줄 삭제, 테스트 expected 목록에서 제거.
- **현재 문제:** 사진 업로드 UI를 모두 제거했으나, `submit_tradein_images` 도구가 `index.ts`에 여전히 등록되어 있음. ChatGPT가 사용자 사진 업로드 시 이 도구를 불필요하게 호출할 수 있음. 현재 흐름은 대화창 사진 업로드 → ChatGPT Vision 분석 → `analyze_tradein_device` 호출이므로 이 도구는 불필요.
- **해결:** `src/index.ts`에서 `submit_tradein_images` 도구 등록 코드 전체 삭제 (registerAppTool 블록). 서버 시작 배너의 해당 줄도 삭제. `get_service_guidelines`의 tool_flow에서도 해당 도구 참조 제거.
- **대상 파일:** `src/index.ts` — `submit_tradein_images` registerAppTool 블록 (~line 560~640), 시작 배너의 해당 줄

### F-5. Galaxy Club 플랜 benefits 한글화
- [x] **완료** — `plans.json`의 3개 플랜(ngc-basic, ngc-premium, ngc-family) benefits 배열 전체 한글화
- **현재 문제:** galaxyClubWidget에서 각 플랜의 혜택 목록(`benefits`)이 영어로 표시됨. 예: "Device upgrade every 24 months", "Samsung Care+ Basic included ($11.99/mo value)". 위젯의 `benefits.slice(0, 6)`으로 최대 6개가 그대로 노출됨.
- **해결:** `src/data/plans.json`의 3개 플랜(`ngc-basic`, `ngc-premium`, `ngc-family`)의 `benefits` 배열 내 문자열을 한글로 변경. 예시:
  ```
  ngc-basic benefits:
  - "24개월마다 기기 업그레이드"
  - "Samsung Care+ Basic 포함 ($11.99/월 가치)"
  - "우선 고객 지원"
  - "모든 주문 무료 표준 배송"
  - "멤버 전용 특별 혜택"
  - "Galaxy AI 기능 포함"
  ```
  Premium, Family 플랜도 동일하게 한글화. `not_included` 배열도 위젯에서 사용하지 않으므로 한글화 불필요 (위젯 코드에서 `not_included`를 렌더링하지 않음을 확인함).
- **대상 파일:** `src/data/plans.json` — `plans[].benefits` 배열

### F-6. 위젯 CTA 버튼 클릭 시 반응 없음 — 외부 링크 연결 필요
- [x] **완료** — 4개 위젯의 CTA에 samsung.com URL 포함. `ui/message`에 URL을 텍스트로 포함하여 ChatGPT가 링크 표시.
- **현재 문제:** 모든 위젯의 CTA 버튼 ("Galaxy Club 가입하기", "Care+ Premium 가입하기", "견적 수락하기" 등)이 `window.parent.postMessage`로 `ui/message`만 보냄. 사용자가 버튼을 눌러도 채팅에 텍스트가 입력될 뿐, 실제 가입 페이지나 samsung.com으로 이동하지 않음. 데모 시 사용자가 버튼을 눌렀는데 아무 일도 안 일어나는 것처럼 보임.
- **해결:** 최종 행동(가입, 수락 등) CTA 버튼에 `window.open()` 또는 `window.parent.postMessage`의 `ui/open-url` 등으로 외부 URL 연결 추가. 데모용이므로 samsung.com 대표 URL로 연결해도 무방.
  - "Galaxy Club 가입하기" → `https://www.samsung.com/sec/galaxy-club/`
  - "Care+ 가입하기" → `https://www.samsung.com/sec/care-plus/`
  - "견적 수락하기" → 확인 패널 표시 후 수락 시 `https://www.samsung.com/sec/trade-in/`
  - "자세히 알아보기" → 해당 서비스 페이지
- **구현 위치:**
  - `src/widgets/galaxyClubWidget.ts` — `selectPlan()` 함수
  - `src/widgets/carePlusWidget.ts` — `enrollCarePlus()` 함수
  - `src/widgets/tradeinWidget.ts` — `confirmAccept()` 함수
  - `src/widgets/comparisonWidget.ts` — `enrollClub()` 함수
- **참고:** Apps SDK에서 iframe 내 `window.open()`이 차단될 수 있음. 그 경우 `ui/message`로 URL을 포함한 텍스트를 보내고 ChatGPT가 링크를 표시하도록 유도하는 방식으로 대체.

### F-7. 한국 데모용 원화(KRW) 가격 표시
- [x] **완료** — 서버 헬퍼 함수(`fmtPrice`, `fmtAdj`, `getCurrencyInfo`, `getAllCurrencyRates`) 추가. Trade-in 도구 4개에서 region 기반 현지 통화 변환. Care+/Galaxy Club/비교 위젯에 `currency_rates`/`regional_pricing` 전달, 위젯에서 `navigator.language` 기반 자동 변환.
- **현재 문제:** 모든 가격이 USD로 표시됨 ($11.99, $55/월 등). 한국 데모 시 사용자에게 혼란을 줌. ChatGPT가 직접 "미국 기준 정책일 가능성이 높습니다"라고 안내하는 상황 발생.
- **영향 범위:**
  - Care+ 플랜 가격 ($11.99/월, $17.99/월)
  - Galaxy Club 플랜 가격 ($35/월, $55/월, $89/월)
  - Trade-in 보상가 (전체 USD)
  - 비교 위젯 금액 (전체 USD)
- **해결:** `care_plus.json`과 `plans.json`에는 이미 `regional_pricing`/`pricing_by_device_category` 데이터가 있으나, 도구와 위젯에서 사용하지 않고 있음. 아래 순서로 수정:
  1. `get_service_guidelines`에서 사용자 언어가 한국어이면 KR 가격 사용하도록 가이드 추가
  2. `get_care_plus_info` — `pricing_by_device_category` 기반으로 기기 카테고리별 원화 가격을 structuredContent에 추가
  3. `get_galaxy_club_info` — `regional_pricing.KR` 가격을 structuredContent에 추가
  4. carePlusWidget, galaxyClubWidget — 원화 가격이 있으면 "$11.99" 대신 "₩11,990" 또는 "11,990원" 형태로 표시
  5. Trade-in/비교 위젯 — `search_tradein_value`와 `compare_galaxy_club_cost`에서 이미 region 기반 환산을 하므로, 위젯에서 `local_value`를 USD보다 우선 표시
- **대상 파일:** `src/index.ts` (도구 3개), `src/widgets/carePlusWidget.ts`, `src/widgets/galaxyClubWidget.ts`, `src/widgets/comparisonWidget.ts`

### F-8. Vision 연계 흐름 정리 — outdated 코드 제거 및 확정된 흐름 반영
- [x] **완료** — submit_tradein_images 삭제(F-4), status `pending_images`→`initial_estimate` 변경, tradeinWidget dead code 정리(.photo-hint CSS, photoHintHtml 변수, handleCTA else분기), 배너/테스트 업데이트. guidelines의 tool_flow 업데이트는 별도(F-9 스코프).
- **확정된 Vision 흐름:** 사용자가 ChatGPT 대화창에 사진 업로드 → ChatGPT Vision이 사진 분석 → 분석 결과(screen_condition, body_condition, camera_condition)를 MCP 도구의 파라미터로 전달. 위젯에서의 별도 사진 업로드는 없음.
- **현재 문제:** 이 확정 흐름과 맞지 않는 outdated 코드가 여러 곳에 남아 있음.
- **점검 및 수정 항목:**
  1. **`submit_tradein_images` 도구 제거** (F-4와 동일) — 이 도구는 위젯에서 사진 파일을 직접 받는 설계. 확정된 흐름에서는 불필요. `index.ts`에서 registerAppTool 블록 전체 삭제.
  2. **`get_service_guidelines`의 trade_in tool_flow 업데이트** — 현재 `submit_tradein_images`가 포함되어 있음. 제거하고 흐름을 `start_tradein_appraisal → (사진 업로드 안내) → analyze_tradein_device → get_tradein_result`로 수정.
  3. **`start_tradein_appraisal` description 점검** — "사진을 업로드해 주세요"라는 안내가 있는데, 이것이 "대화창에 사진을 첨부해 주세요"로 명확히 대화창을 가리키는지 확인. "위젯에서" 같은 표현이 남아있으면 삭제.
  4. **tradeinWidget의 사진 관련 잔존 코드 정리** — `.photo-hint` CSS 클래스 정의가 아직 남아있음 (사용하지 않지만 dead code). `handleCTA()` 함수의 else 분기에서 "기기 사진을 업로드하여 정확한 견적을 받고 싶습니다" 메시지를 보내는데, 사진 업로드 CTA가 없으므로 이 분기에 도달할 일이 없음. 정리 필요.
  5. **`appraisalStore`의 `status: "pending_images"` 재검토** — `start_tradein_appraisal`이 생성하는 appraisal의 초기 status가 `pending_images`인데, 사진 업로드 단계가 없으므로 `pending_vision` 또는 `initial_estimate`로 변경하는 것이 의미상 정확.
  6. **서버 시작 배너에서 `submit_tradein_images` 줄 삭제**
  7. **테스트 코드 (`test/mcp-server.test.mjs`) 업데이트** — `submit_tradein_images` 관련 테스트가 없으므로 tools list 검증에서 해당 도구를 expected 목록에서 제거해야 함 (제거 후)
- **대상 파일:** `src/index.ts`, `src/widgets/tradeinWidget.ts`, `test/mcp-server.test.mjs`

---

## 🔴 테스트 준비 — 개발 task

> 시나리오별 MCP Tool 호출 정답지, 로그 검증 체크리스트, 오작동 패턴은 `DEMO_TEST_ANSWER_KEY.md`에 별도 관리.

### F-9. `get_service_guidelines`에 사진 촬영 가이드 + Vision 분석 가이드 보강
- [x] **완료** — `photo_request_guide`(필수/선택/안되는 사진) + `analysis_guide`(4단계: 검증→판정→보수적 규칙→UC별 도구 분기) 추가.
- **현재 문제:** `vision_photo_guide`가 `{ when: "...", how: "..." }` 한 줄씩만 있어 GPT가 사용자에게 구체적 촬영 안내를 못 하고, 사진 분석 시에도 기준이 모호함. 실제 테스트에서 GPT가 자체적으로 촬영 가이드를 만들어 안내했지만, 이 내용이 MCP 도구에 공식화되어 있지 않으면 매번 다르게 안내할 수 있음.
- **추가해야 할 내용:**
  1. **사용자 촬영 가이드** (GPT가 사진 요청 시 사용자에게 안내할 내용)
     - 앞면 전체: 화면이 꺼진 상태에서 기기 전체가 보이도록 1장
     - 뒷면 전체: 카메라 모듈이 선명하게 보이도록 1장
     - 조명: 밝은 곳에서, 반사/그림자 최소화, 초점 선명하게
     - 흠집/파손 있을 경우: 해당 부위 근접 사진 추가
     - **안 되는 사진**: 스크린샷, 렌더링/일러스트 이미지, 케이스 착용 상태, 화면 켜진 상태(배경화면 보임)
  2. **GPT Vision 분석 가이드** (GPT가 사진을 받았을 때 어떻게 판단할지)
     - 먼저 실제 기기 사진인지 검증 (일러스트/렌더링/스크린샷이면 거부하고 재촬영 요청)
     - 화면 상태 판단 기준: 스크래치 없음→`no_scratches`, 미세 생활 기스→`light_scratches`, 눈에 보이는 긁힘→`visible_scratches`, 깨짐/금→`cracked`
     - 외관 상태 판단 기준: 새것 같음→`pristine`, 미세한 사용감→`minor_wear`, 찍힘/함몰→`dents_scratches`, 심한 파손→`major_damage`
     - 카메라 렌즈 판단 기준: 깨끗→`clear`, 약간 얼룩/먼지→`minor_smudge`, 스크래치→`scratched`, 깨짐→`cracked`
     - 애매한 경우 보수적으로 판단 (예: `light_scratches`와 `visible_scratches` 사이면 `visible_scratches`)
     - 판단 후 UC에 따라 올바른 도구 호출: Care+ → `check_care_plus_eligibility`, Trade-in → `analyze_tradein_device`
- **대상 파일:** `src/index.ts` — `get_service_guidelines` 도구의 `vision_photo_guide` 객체 확장
- **참고:** 현재 `check_care_plus_eligibility`와 `analyze_tradein_device`의 description에도 분석 기준이 있지만, `get_service_guidelines`가 GPT가 가장 먼저 참조하는 가이드이므로 여기에 통합 정리하는 것이 중요

### F-10. MCP 서버 요청 로깅 추가
- [x] **완료** — `registerAppToolWithLogging` wrapper로 전 도구 자동 로깅. 타임스탬프 + 도구명 + args + 응답 요약(appraisal_id, value, plans, savings, eligible 등) 출력.
- **현재 문제:** MCP 서버에 도구별 요청/응답 로그가 없어서, 테스트 시 ChatGPT가 어떤 도구를 어떤 파라미터로 호출했는지 확인할 방법이 서버 콘솔 로그뿐임. 체계적 로깅이 없으면 오작동 디버깅이 어려움.
- **해결:** 각 `registerAppTool` 핸들러 시작 부분에 요청 로그, 끝 부분에 응답 로그 추가. 타임스탬프 + 도구명 + 파라미터 + 응답 요약을 출력.
- **구현:**
  ```typescript
  // 각 도구 핸들러 시작
  console.log(`[${new Date().toISOString()}] [TOOL] ${toolName} called with:`, JSON.stringify(args, null, 2));
  // 각 도구 핸들러 끝
  console.log(`[${new Date().toISOString()}] [TOOL] ${toolName} response: ${status}`);
  ```
- **대상 파일:** `src/index.ts` — 모든 registerAppTool 핸들러

### F-12. `analyze_tradein_device` 재산정 로직 버그 — 파손 기기가 양호 기기보다 비싸지는 문제
- [x] **완료** — `region_adjustment`, `carrier_adjustment`를 재산정에 반영. `regionAdjustedBase` 기준으로 conditionMultiplier 적용. `baseValue` 초과 방지 cap 추가.
- **현재 문제:** `analyze_tradein_device`가 Vision 결과로 재산정할 때, 원래 appraisal에 적용된 `region_adjustment`, `carrier_adjustment`, `issues_deduction`을 **무시하고** `base_value`에서 `conditionMultiplier`만 적용하여 재계산함. 결과적으로:
  - 초기 견적: base $450 × KR(0.92) = $414 - condition poor(-$270) - issues(-$100) + promo(+$50) = **$94**
  - Vision 재산정: base $450 × good(0.85) = $382 + promo(+$50) = **$432**
  - region, carrier, issues_deduction이 빠져서 $94 → $432로 상향되는 비정상적 결과 발생
- **해결:** `src/index.ts`의 `analyze_tradein_device` 핸들러(~line 1404-1409)에서 재산정 시 appraisal에 저장된 `region_adjustment`, `carrier_adjustment`를 반영해야 함:
  ```typescript
  // 현재 (버그)
  const newFinalValue = Math.max(0, baseValue + conditionAdjustment + promotionalBonus);

  // 수정 후
  const regionAdj = appraisal.valuation.region_adjustment || 0;
  const carrierAdj = appraisal.valuation.carrier_adjustment || 0;
  const regionAdjustedBase = baseValue + regionAdj;
  const newFinalValue = Math.max(0, regionAdjustedBase + conditionAdjustment + carrierAdj + promotionalBonus);
  ```
  - `issues_deduction`은 Vision으로 상태를 재판정했으므로 제외해도 됨 (Vision 결과가 issues를 대체)
  - 단, 최종 값이 원래 견적보다 비정상적으로 높아지지 않도록 sanity check 추가: `newFinalValue`가 `baseValue`를 초과하면 `baseValue`로 cap
- **검증 방법:** 동일 기기에 대해 condition=poor로 초기 견적 → Vision에서 good으로 재산정 시, 재산정 값이 condition=good으로 직접 견적 낸 것과 동일해야 함
- **대상 파일:** `src/index.ts` — `analyze_tradein_device` 핸들러
- **테스트 코드 업데이트:** `test/mcp-server.test.mjs`에 "Vision 재산정 값이 base_value를 초과하지 않음" 테스트 추가

### F-13. 통화 표시 통일 — 국가별 현지 통화로 표시
- [x] **완료** — F-7과 통합 구현. 6개 지역(US/KR/UK/DE/JP/SG) 지원. Trade-in 도구: 서버에서 `fmtPrice()`로 변환. Galaxy Club: `regional_pricing` 데이터로 실제 현지 가격 표시. Care+/비교: `currency_rates`로 위젯에서 변환. `devices.json`의 `region_multipliers` 활용.
- **현재 문제:** 모든 도구와 위젯이 USD($)로만 가격을 표시함. 한국에서 구매한 기기(region=KR)도 "$94", "$432"로 표시되어 혼란 발생. ChatGPT가 "미국 기준 정책일 가능성이 높습니다"라고 안내하는 상황.
- **규칙:**
  - region=KR → 원화(₩ 또는 "원")로 표시, USD 표시 제거
  - region=JP → 엔화(¥ 또는 "円")로 표시
  - region=UK → 파운드(£)로 표시
  - region=DE → 유로(€)로 표시
  - region=US → 달러($) 유지
  - region=SG → 싱가포르 달러(S$)로 표시
- **영향 범위 및 수정 위치:**
  1. **`start_tradein_appraisal`** (index.ts ~line 531,546-552): content.text와 breakdown의 가격 문자열. `regionData.currency_symbol`과 `regionData.base_rate`를 사용하여 변환. 예: region=KR, finalValue=$94 → `94 * 1350 = 126,900원`
  2. **`analyze_tradein_device`** (index.ts ~line 1420-1445): 동일하게 현지 통화 적용
  3. **`get_tradein_result`** (index.ts ~line 697-701): appraisal에 저장된 region 정보로 통화 변환
  4. **`search_tradein_value`** (index.ts ~line 830-841): 이미 `local_value`를 계산하고 있음. 위젯에서 USD 대신 `local_value`를 우선 표시하도록 변경
  5. **tradeinWidget.ts**: `renderAppraisal()`의 price-section, breakdown에서 `data.region` 정보가 있으면 현지 통화로 표시. `renderSearchResults()`에서 `local_value`가 있으면 우선 표시
  6. **`get_care_plus_info`** (index.ts): `pricing_by_device_category` 데이터를 활용하여 기기별 현지 가격 반환
  7. **`get_galaxy_club_info`** (index.ts): `regional_pricing` 데이터를 structuredContent에 포함하고, 위젯에서 사용자 locale에 맞는 가격 표시
  8. **carePlusWidget.ts**: `data.device_pricing`이 있으면 현지 통화 가격 표시
  9. **galaxyClubWidget.ts**: `data.regional_pricing`이 있으면 현지 통화 가격 표시
  10. **comparisonWidget.ts**: 비교 금액을 현지 통화로 표시
- **환산 로직 (공통):**
  ```javascript
  function formatLocalPrice(usdValue, region, regionData) {
    if (region === 'US' || !regionData.base_rate) return '$' + usdValue;
    const localValue = Math.round(usdValue * regionData.base_rate);
    if (region === 'KR') return localValue.toLocaleString() + '원';
    return regionData.currency_symbol + localValue.toLocaleString();
  }
  ```
- **대상 파일:** `src/index.ts` (도구 5개), `src/widgets/tradeinWidget.ts`, `src/widgets/carePlusWidget.ts`, `src/widgets/galaxyClubWidget.ts`, `src/widgets/comparisonWidget.ts`

### F-14. `analyze_tradein_device` structuredContent에 region 라벨 누락
- [x] **완료** — `appraisal.region`, `appraisal.carrier`를 structuredContent에 추가. breakdown에 region/carrier 줄 추가. next_steps/cta.text 한글화.
- **현재 문제:** `analyze_tradein_device`가 반환하는 structuredContent에서 appraisal의 `region` 정보를 전달하지 않음. 위젯이 재산정 결과를 표시할 때 어느 국가 기준인지 알 수 없어 통화 변환 불가.
- **해결:** `src/index.ts`의 `analyze_tradein_device` 핸들러에서 `appraisal.region`과 `appraisal.carrier`를 structuredContent에 추가:
  ```typescript
  structuredContent: {
    ...
    region: appraisal.region,
    carrier: appraisal.carrier,
    ...
  }
  ```
- **대상 파일:** `src/index.ts` — `analyze_tradein_device` 핸들러의 return structuredContent 객체 (~line 1432)

### F-15. Care+ 위젯 "기기 사진 업로드하기" CTA 버튼 제거
- [x] **완료** — Late Enrollment 분기에서 사진 버튼 → 플랜 선택 CTA("가입 상담하기")로 교체. `requestVisionCheck()` dead 함수 삭제.
- **현재 문제:** Care+ 위젯에서 Late Enrollment 상태일 때 하단 CTA가 "기기 사진 업로드하기" 버튼으로 표시됨 (스크린샷 참고). 확정된 Vision 흐름에서는 사진 업로드를 위젯이 아니라 대화창에서 하므로, 이 버튼은 사용자에게 혼란을 줌. F-3 (Trade-in 위젯 사진 업로드 제거)과 동일한 맥락.
- **해결:** `src/widgets/carePlusWidget.ts`의 CTA 생성 로직에서 `eligible_late_enrollment` 분기의 "기기 사진 업로드하기" 버튼을 제거. 대신 "플랜 비교 상세" 또는 아무 CTA 없이 enrollment 배너만 표시. 사진 업로드 안내는 ChatGPT가 대화로 처리함.
- **수정 위치:** `src/widgets/carePlusWidget.ts` — `renderCarePlus()` 함수 내 CTA 생성 블록에서 `eligible_late_enrollment` 분기:
  ```javascript
  // 현재 (삭제 대상)
  } else if (data.enrollment_status?.status === 'eligible_late_enrollment') {
    ctaHtml += '<button class="cta-button primary" onclick="requestVisionCheck()">기기 사진 업로드하기</button>';

  // 수정 후 — Late Enrollment 상태에서는 플랜 선택만 가능하게
  } else if (data.enrollment_status?.status === 'eligible_late_enrollment') {
    if (selectedPlanId) {
      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      const planLabel = selectedPlan ? selectedPlan.name : 'Care+';
      ctaHtml += '<button class="cta-button primary" onclick="enrollCarePlus(\\'' + selectedPlanId + '\\')">' + planLabel + ' 가입 상담하기</button>';
    } else {
      ctaHtml += '<button class="cta-button primary" style="opacity:0.6" disabled>플랜을 선택해주세요</button>';
    }
  ```
- **추가:** `requestVisionCheck()` 함수도 사용하지 않으므로 삭제 가능 (dead code 정리)
- **대상 파일:** `src/widgets/carePlusWidget.ts`

### F-16. Care+ 위젯 FAQ 표시 개수 제한
- [x] **완료** — `.slice(0, 3)` + "더 많은 질문이 있으시면 채팅으로 물어보세요" 안내 추가.
- **현재 문제:** `care_plus.json`의 FAQ가 10개이고 전부 위젯에 표시됨. 위젯이 지나치게 길어져서 플랜 카드와 CTA가 스크롤 아래로 밀림. Inline Card 규칙상 내부 스크롤 금지이므로, FAQ가 많으면 위젯 높이가 과도해짐.
- **해결:** `src/widgets/carePlusWidget.ts`의 `renderCarePlus()` 함수에서 FAQ를 최대 **3개**만 표시하도록 제한. 나머지는 "더 보기" 텍스트로 대화 연결.
- **수정 위치:** `src/widgets/carePlusWidget.ts` — FAQ 렌더링 부분:
  ```javascript
  // 현재
  const faqs = data.faq || [];

  // 수정 후 — 최대 3개만 표시
  const faqs = (data.faq || []).slice(0, 3);
  ```
  - FAQ 3개 아래에 "더 많은 질문이 있으시면 채팅으로 물어보세요" 안내 텍스트 추가 (선택)
- **대상 파일:** `src/widgets/carePlusWidget.ts`
- **참고:** `get_care_plus_info` 도구에서 FAQ 수를 제한하는 것이 아님 (도구는 전체 데이터를 반환하되 위젯에서 UI 제한). ChatGPT 텍스트 응답에서는 필요 시 더 많은 FAQ를 안내할 수 있음.

### F-11. 시나리오별 MCP Tool 호출 정답지 문서 작성
- [x] **완료** — `DEMO_TEST_ANSWER_KEY.md` 생성. UC1/UC2/UC3 각 턴별 기대 도구/파라미터/응답/금지 도구 + 로그 검증 포맷 + 오작동 패턴 8건 + 로그 체크리스트.
- **설명:** UC1/UC2/UC3 각 턴마다 기대되는 MCP 도구, 파라미터, 응답, 호출하면 안 되는 도구를 정답지로 문서화. 테스트 시 서버 로그와 대조하여 검증하는 데 사용.
- **산출물:** `DEMO_TEST_ANSWER_KEY.md` (별도 파일)
- **포함 내용:** 턴별 정답지 테이블, 로그 검증 체크리스트, 흔한 오작동 패턴과 대응 (도구 description 튜닝 방향)
