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
