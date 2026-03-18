# 데모 시나리오 — Claude Playwright 자동화용

> 이 파일은 Claude Code가 Playwright MCP 도구를 사용하여 ChatGPT에서 Samsung Galaxy MCP 서버를 테스트할 때 참고하는 가이드입니다.

## 사전 조건

### 1. MCP 서버 실행 확인
```bash
# 서버가 8787 포트에서 실행 중인지 확인
curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/mcp
# 200 또는 405 응답이면 정상. "not running"이면 서버 시작 필요:
cd samsung-galaxy-mcp/server && npm run build && node dist/index.js
```

### 2. ngrok 터널 확인
```bash
# ngrok이 8787을 터널링 중인지 확인
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"'
# ngrok URL이 index.ts의 WIDGET_DOMAIN과 일치하는지 확인
```

### 3. ChatGPT 로그인
- Playwright로 `https://chatgpt.com` 접속
- 로그인 안 되어 있으면 사용자에게 요청 (자동 로그인 불가)
- 로그인 확인: 스크린샷에서 사용자 이름 또는 "개발자 모드" 표시 확인

---

## Playwright 도구 사용 패턴

### 페이지 이동
```
mcp__plugin_playwright_playwright__browser_navigate(url: "https://chatgpt.com")
```

### 스냅샷 (요소 ref 확인용)
```
mcp__plugin_playwright_playwright__browser_snapshot()
```

### 스크린샷 (시각적 확인용)
```
mcp__plugin_playwright_playwright__browser_take_screenshot(type: "png")
mcp__plugin_playwright_playwright__browser_take_screenshot(type: "png", fullPage: true)
```

### 텍스트 입력 + 전송
```
# snapshot에서 textbox ref를 찾아서 사용 (보통 프롬프트 입력창)
mcp__plugin_playwright_playwright__browser_type(ref: "<textbox_ref>", text: "메시지 내용", submit: true)
```

### 파일 업로드
```
# 1. "파일 추가 및 기타" 버튼 클릭
mcp__plugin_playwright_playwright__browser_click(ref: "<plus_btn_ref>")

# 2. "사진 및 파일 추가" 메뉴 클릭
mcp__plugin_playwright_playwright__browser_click(ref: "<file_menu_ref>")

# 3. 파일 업로드 (File chooser 모달이 열린 상태에서)
mcp__plugin_playwright_playwright__browser_file_upload(paths: ["C:/path/to/image.jpg"])

# 4. 메시지 입력 + 전송
mcp__plugin_playwright_playwright__browser_type(ref: "<textbox_ref>", text: "메시지", submit: true)
```

### 스크롤
```
mcp__plugin_playwright_playwright__browser_press_key(key: "PageDown")
mcp__plugin_playwright_playwright__browser_press_key(key: "PageUp")
mcp__plugin_playwright_playwright__browser_press_key(key: "Control+Home")  # 맨 위로
```

### 응답 대기
```bash
# ChatGPT 응답 생성 대기 (MCP 도구 호출 포함 시 15~30초)
sleep 15  # 일반 응답
sleep 25  # Vision 분석 포함 응답
sleep 30  # 복잡한 도구 호출 체인
```

### 위젯 iframe 내부 요소 클릭
```
# snapshot에서 iframe 내 요소는 ref가 "f22e..." 형태
# 직접 클릭 가능:
mcp__plugin_playwright_playwright__browser_click(ref: "f22e90")
```

---

## 테스트 이미지 준비

ChatGPT Vision 테스트에 사용할 이미지가 필요할 때:

```bash
# 랜덤 테스트 이미지 (Vision 분석은 되지만 기기 사진이 아니므로 MCP 도구 연계 안 됨)
curl -L -o "C:/Users/user/samsung-galaxy-mcp-share/s24_front.jpg" "https://picsum.photos/400/600"
curl -L -o "C:/Users/user/samsung-galaxy-mcp-share/s24_back.jpg" "https://picsum.photos/400/600"

# 주의: 실제 Galaxy S24 Ultra 사진이 있어야 Vision → check_care_plus_eligibility 연계 테스트 가능
# 삼성 CDN, 위키미디어 등은 curl 다운로드 차단됨
```

---

## UC1: Samsung Care+ Late Enrollment

### 턴 1 — Care+ 가입 문의
```
1. navigate → https://chatgpt.com  (또는 기존 대화 URL)
2. snapshot → textbox ref 확인
3. type(ref, "Galaxy S24 Ultra를 작년 10월에 샀는데, Samsung Care+에 지금도 가입할 수 있나요?", submit: true)
4. sleep 20  (MCP 도구 호출 + 위젯 렌더링)
5. screenshot → Care+ 위젯 확인
6. press_key("Control+Home") → 위젯이 위에 있을 수 있으므로 맨 위로 스크롤
7. screenshot → 위젯 전체 확인
```

**검증 포인트:**
- Care+ 위젯 렌더링됨 (iframe 내부)
- Late Enrollment 황색 배너 표시
- 플랜 카드 2개 (Basic/Premium)
- CTA: "기기 사진 업로드하기"
- 이미지 업로드 그리드 없음 (0-1 수정 확인)

### 턴 2 — 기기 사진 업로드
```
1. snapshot → "파일 추가 및 기타" 버튼 ref 확인
2. click(ref)  → 메뉴 열림
3. snapshot → "사진 및 파일 추가" menuitem ref 확인
4. click(ref)  → File chooser 열림
5. file_upload(paths: ["C:/path/to/s24_front.jpg", "C:/path/to/s24_back.jpg"])
6. snapshot → 입력창에 이미지 첨부 확인
7. type(ref, "제 Galaxy S24 Ultra 앞면과 뒷면 사진이에요. 상태 확인해주세요.", submit: true)
8. sleep 25  (Vision 분석 + MCP 도구 호출)
9. screenshot → Vision 분석 결과 + 위젯 업데이트 확인
```

**검증 포인트 (실제 기기 사진 사용 시):**
- Vision 분석 → check_care_plus_eligibility 도구 호출
- 위젯 업데이트: "Late Enrollment 승인!" 녹색 배너
- 상태 인디케이터 (화면/외관/카메라 🟢)
- CTA 변경: 플랜 선택 가능 상태

### 턴 3 — 플랜 비교 질문
```
1. type(ref, "Premium이랑 Basic 차이가 뭐예요? 분실도 보장되나요?", submit: true)
2. sleep 15
3. screenshot → 상세 비교 응답 확인
```

### 턴 4 — 플랜 선택
```
1. type(ref, "그럼 Premium으로 가입할게요", submit: true)
2. sleep 15
3. screenshot → CTA "Care+ Premium 가입하기" 활성화 확인
```

---

## UC2: New Galaxy Club 상담

### 턴 1 — Galaxy Club 소개
```
1. navigate → https://chatgpt.com (새 채팅)
2. type(ref, "Galaxy Club이 뭔가요? 매년 새 폰을 쓸 수 있다고 들었는데", submit: true)
3. sleep 20
4. press_key("Control+Home")
5. screenshot → Galaxy Club 위젯 확인
```

**검증 포인트:**
- Galaxy Club 위젯 렌더링
- 탭 UI (B-1): 플랜 탭 전환 가능
- 기기 선택 드롭다운 (0-4)
- 라이프사이클 타임라인 애니메이션 (B-4)
- 스켈레톤 로딩 (E-4)

### 턴 2 — 위젯 내 비용 비교 (tools/call)
```
1. snapshot → iframe 내 기기 드롭다운 ref 확인
2. click → 기기 선택 (Galaxy S25 Ultra)
3. click → "비용 비교하기" 버튼
4. sleep 10  (tools/call로 위젯 내에서 직접 호출)
5. screenshot → 비교 위젯 또는 비교 결과 확인
```

### 턴 3 — Trade-in 적용 문의
```
1. type(ref, "현재 S23 Ultra 쓰고 있는데, 이거 Trade-in하면 더 싸지나요?", submit: true)
2. sleep 20
3. screenshot → 비교 위젯 업데이트 (Trade-in 반영)
```

---

## UC3: Trade-in 카메라 견적

### 턴 1 — 보상판매 문의
```
1. navigate → https://chatgpt.com (새 채팅)
2. type(ref, "보상판매 얼마 받을 수 있는지 알아보고 싶어요", submit: true)
3. sleep 20
4. press_key("Control+Home")
5. screenshot → Trade-in 위젯 확인
```

**검증 포인트:**
- Trade-in 위젯 렌더링
- 검색 입력창 표시 (0-3)
- 스켈레톤 로딩 (E-4)

### 턴 2 — 위젯 내 검색 (tools/call)
```
1. snapshot → iframe 내 검색 input ref 확인
2. type(ref, "S23 Ultra") → 검색 버튼 클릭
3. sleep 10
4. screenshot → 용량/상태 칩 + 가격 표시 확인
5. click → 256GB 칩, Good 상태 칩
6. screenshot → 가격 업데이트 확인
```

### 턴 3 — 기기 사진으로 정밀 견적
```
1. "파일 추가" → 기기 사진 업로드 (턴 2와 동일 패턴)
2. type(ref, "이 기기로 정확한 견적을 받고 싶어요", submit: true)
3. sleep 25
4. screenshot → Before/After 가격 비교 + Vision 상태 인디케이터
```

**검증 포인트:**
- Before/After 가격 비교 표시
- 상태 인디케이터 (화면/외관/카메라)
- "견적 수락하기" 버튼 → 확인 패널 (C-4)

### 턴 4 — 견적 수락
```
1. snapshot → iframe 내 "견적 수락하기" 버튼 ref
2. click(ref)
3. screenshot → 확인 패널 ("$XXX에 수락하시겠습니까? [수락] [취소]")
4. click → "수락" 버튼
5. sleep 10
6. screenshot → 수락 완료 메시지
```

---

## 비교 위젯 기간 슬라이더 테스트 (D-1)

UC2 비용 비교 시:
```
1. 비교 위젯이 표시된 상태에서 snapshot
2. iframe 내 슬라이더 input[type=range] ref 확인
3. 슬라이더 값 변경 (JavaScript로):
   browser_run_code → page.locator('input[type=range]').fill('24')
4. screenshot → 24개월 기준 비용 재계산 확인
```

---

## 다크 모드 테스트 (E-3)

```
1. ChatGPT 설정에서 다크 모드 활성화
2. 아무 시나리오 실행
3. screenshot → 위젯이 다크 배경에 맞게 표시되는지 확인
```

---

## 트러블슈팅

### ChatGPT 응답이 느릴 때
- sleep 시간을 30~40초로 늘림
- snapshot으로 "스트리밍 중지" 버튼 존재 여부 확인 → 있으면 아직 생성 중

### 위젯이 안 보일 때
- MCP 서버 실행 여부 확인
- ngrok 터널 활성 확인
- index.ts의 WIDGET_DOMAIN이 현재 ngrok URL과 일치하는지 확인
- ChatGPT에서 "Samsung in ChatGPT" 앱이 연결되어 있는지 확인

### 파일 업로드가 안 될 때
- 파일 경로를 절대 경로로 지정 (C:/Users/...)
- 파일이 실제 이미지인지 확인: `file <path>` → "JPEG image data" 확인
- "파일 추가 및 기타" → "사진 및 파일 추가" 순서로 클릭 후 File chooser 상태에서만 upload 가능
