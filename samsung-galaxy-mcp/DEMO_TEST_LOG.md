# 데모 테스트 로그

## 테스트 환경
- **날짜:** 2026-03-16
- **ChatGPT 모델:** 5.4 Thinking
- **ChatGPT 계정:** Junsung Kim (Plus)
- **MCP 서버:** localhost:8787 (ngrok 터널 활성)
- **브라우저:** Playwright (Chromium)

---

## UC1: Samsung Care+ Late Enrollment

### 턴 1 — Care+ 가입 문의
- **입력:** "Galaxy S24 Ultra를 작년 10월에 샀는데, Samsung Care+에 지금도 가입할 수 있나요?"
- **결과:**
  - MCP 도구 호출됨 (`get_care_plus_info`)
  - Care+ 위젯 정상 렌더링
    - 헤더: "Samsung Care+" + "삼성 공식 기기 보험 서비스"
    - Late Enrollment 배너: "구매 후 60일 초과 — Vision 검사로 Late Enrollment 가능" (황색)
    - 플랜 카드: Basic ($11.99/월), Premium ($17.99/월, 추천 배지)
    - 자기부담금 표시 정상
    - FAQ 아코디언 10개 항목 정상
    - CTA: "기기 사진 업로드하기" (Late Enrollment 상태에 맞게)
  - 스켈레톤 로딩 → 위젯 전환 정상
  - 텍스트 응답: 166일 경과, Late Enrollment 대상, Vision 검사 필요, $49 수수료 안내
- **스크린샷:** `.playwright-mcp/page-2026-03-16T08-29-48-152Z.png`, `page-2026-03-16T08-32-09-154Z.png`
- **상태:** PASS

### 턴 2 — 기기 사진 업로드 (Vision 분석) — 시도 1: 랜덤 이미지
- **입력:** picsum.photos 랜덤 이미지 2장 + "제 Galaxy S24 Ultra 앞면과 뒷면 사진이에요. 상태 확인해주세요."
- **결과:** "기기 자체 사진이 아니라 풍경/배경화면 이미지" → 거부됨 (정상)
- **스크린샷:** `.playwright-mcp/page-2026-03-16T08-44-54-098Z.png`

### 턴 2 — 기기 사진 업로드 (Vision 분석) — 시도 2: PIL 생성 이미지
- **입력:** PIL로 생성한 폰 모양 일러스트 2장 + "제 Galaxy S24 Ultra 앞면과 뒷면 사진입니다. Care+ 가입 가능한지 상태 확인해주세요."
- **결과:** "일러스트/렌더링 이미지로 보여서 판정 불가" → 거부됨 (정상)
- **참고:** Vision이 매우 정확하게 실사진 vs 생성 이미지를 구분함. MCP 도구 연계 테스트는 실제 기기 사진 필수.
- **스크린샷:** `.playwright-mcp/page-2026-03-16T08-59-34-841Z.png`
- **상태:** PARTIAL (Vision 정상 동작 확인, MCP 연계 미테스트)

### 턴 3, 4 — 미테스트

---

## 검증된 개선 사항
- [x] Care+ 위젯 한글 정상 (로딩 메시지, 플랜, FAQ, CTA)
- [x] 스켈레톤 로딩 UI 동작 확인
- [x] Late Enrollment 배너 정상 표시
- [x] 이미지 업로드 그리드 제거됨 (fileParams 삭제 효과 확인)
- [ ] 플랜 선택 인터랙션 (A-1) — eligible 상태에서만 동작, Late Enrollment 상태에선 미노출 (정상)
- [ ] Vision 분석 → check_care_plus_eligibility → 위젯 업데이트 플로우 — 실제 기기 사진 필요

---

## UC2, UC3 — 미테스트
