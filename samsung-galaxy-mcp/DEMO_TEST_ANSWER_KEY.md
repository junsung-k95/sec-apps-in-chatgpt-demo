# 데모 시나리오별 MCP Tool 호출 정답지

> 각 시나리오 턴마다 기대되는 MCP 도구, 파라미터, 응답, 호출하면 안 되는 도구를 정리.
> 서버 로그(`[TOOL]` 라인)와 대조하여 ChatGPT가 올바르게 동작하는지 검증.

---

## 시나리오 1 — UC1: Samsung Care+ Late Enrollment

### 턴 1: "Galaxy S24 Ultra를 작년 10월에 샀는데, Samsung Care+에 지금도 가입할 수 있나요?"

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `get_care_plus_info` |
| **필수 파라미터** | `device_model: "Galaxy S24 Ultra"`, `purchase_date: "2025-10-XX"` (대략적 날짜) |
| **선택 파라미터** | `plan_type: "all"`, `include_faq: true` |
| **기대 응답** | `enrollment_status.status === "eligible_late_enrollment"`, plans 2개 반환 |
| **위젯** | Care+ 위젯 — 황색 배너 "구매 후 60일 초과, Late Enrollment 가능" |
| **호출하면 안 되는 도구** | `check_care_plus_eligibility` (아직 사진 없음), `start_tradein_appraisal` |

**로그 검증:**
```
[TOOL] get_care_plus_info called
  args: {"device_model":"Galaxy S24 Ultra","purchase_date":"2025-10-..."}
[TOOL] get_care_plus_info → OK | plans=2
```

---

### 턴 2: 사용자가 기기 사진 업로드

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `check_care_plus_eligibility` |
| **필수 파라미터** | `device_model: "Galaxy S24 Ultra"`, `purchase_date: "2025-10-XX"`, `vision_analysis: { screen_condition, body_condition, camera_condition }` |
| **GPT Vision 분석** | 사진에서 screen/body/camera 상태를 판단하여 enum 값으로 변환 |
| **기대 응답 (양호)** | `eligibility_result.eligible === true`, plans 2개 반환, 녹색 배너 |
| **기대 응답 (불량)** | `eligibility_result.eligible === false`, `failed_checks` 배열에 실패 항목 |
| **호출하면 안 되는 도구** | `analyze_tradein_device` (Trade-in이 아닌 Care+ 흐름), `start_tradein_appraisal` |

**로그 검증:**
```
[TOOL] check_care_plus_eligibility called
  args: {"device_model":"Galaxy S24 Ultra","purchase_date":"2025-10-...","vision_analysis":{"screen_condition":"light_scratches","body_condition":"minor_wear","camera_condition":"clear"}}
[TOOL] check_care_plus_eligibility → OK | eligible=true
```

---

### 턴 3: "Premium이랑 Basic 차이가 뭐예요?"

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `get_care_plus_info` (상세 비교용) 또는 **도구 호출 없이 이전 결과로 답변** |
| **파라미터 (호출 시)** | `plan_type: "all"`, `include_faq: true` |
| **기대 동작** | 위젯에 이미 표시된 플랜 정보를 텍스트로 요약 설명 |
| **호출하면 안 되는 도구** | `compare_galaxy_club_cost`, `start_tradein_appraisal` |

---

### 턴 4: "그럼 Premium으로 가입할게요"

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | 없음 (가입은 외부 링크로 처리) |
| **기대 동작** | 가입 안내 텍스트 + Care+ 위젯 CTA "Care+ Premium 가입하기" 활성화 |
| **호출하면 안 되는 도구** | 모든 도구 (가입 완료는 MCP 범위 밖) |

---

## 시나리오 2 — UC2: New Galaxy Club 상담

### 턴 1: "Galaxy Club이 뭔가요?"

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `get_galaxy_club_info` |
| **필수 파라미터** | `plan_type: "all"` 또는 미지정 (전체 플랜 조회) |
| **선택 파라미터** | `include_faq: true` |
| **기대 응답** | plans 3개, enrollment_steps, lifecycle_stages 포함 |
| **위젯** | Galaxy Club 위젯 — 탭 UI + 기기 드롭다운 + 라이프사이클 타임라인 |
| **호출하면 안 되는 도구** | `compare_galaxy_club_cost` (아직 비교 요청 안 함) |

**로그 검증:**
```
[TOOL] get_galaxy_club_info called
  args: {"plan_type":"all"}
[TOOL] get_galaxy_club_info → OK | plans=3
```

---

### 턴 2: "Galaxy S25 Ultra, 그냥 사는 거랑 뭐가 더 이득이에요?" 또는 위젯 드롭다운에서 기기 선택

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `compare_galaxy_club_cost` |
| **필수 파라미터** | `device_model: "Galaxy S25 Ultra"`, `plan_type: "premium"` |
| **기대 응답** | `comparison.club` + `comparison.outright`, `savings > 0`, `lifecycle_stages` |
| **위젯** | 비교 위젯 — 좌우 컬럼 + 절약액 배너 + 슬라이더 |
| **호출하면 안 되는 도구** | `start_tradein_appraisal` (Trade-in 요청 안 함) |

**로그 검증:**
```
[TOOL] compare_galaxy_club_cost called
  args: {"device_model":"Galaxy S25 Ultra","plan_type":"premium"}
[TOOL] compare_galaxy_club_cost → OK | savings=$854
```

---

### 턴 3: "현재 S23 Ultra 쓰고 있는데, Trade-in하면 더 싸지나요?"

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `compare_galaxy_club_cost` |
| **필수 파라미터** | `device_model: "Galaxy S25 Ultra"`, `plan_type: "premium"`, `current_device_tradein: "Galaxy S23 Ultra"` |
| **기대 응답** | `tradein_info` 포함 (estimated_value, note), `comparison.outright.tradein_credit > 0` |
| **호출하면 안 되는 도구** | `start_tradein_appraisal`, `search_tradein_value` |

---

### 턴 4: "Galaxy Club으로 할게요. 가입 절차는?"

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `get_galaxy_club_info` (가입 절차 표시용) 또는 **도구 호출 없이 이전 결과로 답변** |
| **기대 동작** | 가입 절차 안내 + CTA "Galaxy Club 가입하기" |

---

## 시나리오 3 — UC3: Trade-in 보상판매

### 턴 1: "보상판매 얼마 받을 수 있어요?" 또는 "Galaxy S23 Ultra 보상판매 가격 알려줘"

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `search_tradein_value` (간단 조회) |
| **필수 파라미터** | `query: "S23 Ultra"`, `region`, `carrier` |
| **사전 수집** | 모델명 외에 **국가/통신사**를 먼저 물어봐야 함. 모델만 있으면 국가/통신사 질문 → 수집 후 호출 |
| **기대 응답** | `results[].valuations` (용량별 가격 범위), `condition_range` (상태별 가격) |
| **위젯** | Trade-in 위젯 — 검색 결과 + 용량/상태 칩 선택 |
| **호출하면 안 되는 도구** | `start_tradein_appraisal` (아직 정식 견적 아님), `analyze_tradein_device` |

**로그 검증:**
```
[TOOL] search_tradein_value called
  args: {"query":"S23 Ultra","region":"KR","carrier":"unlocked"}
[TOOL] search_tradein_value → OK | results=1
```

---

### 턴 2: "정식 견적 받고 싶어요" (또는 위젯에서 "정식 견적 받기" 클릭)

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `start_tradein_appraisal` |
| **필수 파라미터** | `device_model`, `device_condition`, `region`, `carrier` |
| **선택 파라미터** | `storage_capacity`, `functional_issues`, `cosmetic_issues` |
| **사전 수집** | 모델, 용량, 상태, 국가, 통신사, 기능/외관 문제 — **모두 수집 후 호출** |
| **기대 응답** | `appraisal_id`, `valuation.final_value > 0`, `status === "initial_estimate"` |
| **위젯** | Trade-in 위젯 — 견적 결과 카드 |
| **호출하면 안 되는 도구** | `search_tradein_value` (이미 조회 완료) |

**로그 검증:**
```
[TOOL] start_tradein_appraisal called
  args: {"device_model":"Galaxy S23 Ultra","storage_capacity":"256GB","device_condition":"good","region":"KR","carrier":"unlocked"}
[TOOL] start_tradein_appraisal → OK | appraisal=appr-xxxx, value=$XXX
```

---

### 턴 3: 사용자가 기기 사진 업로드

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `analyze_tradein_device` |
| **필수 파라미터** | `appraisal_id` (턴 2에서 받은 ID), `vision_analysis: { screen_condition, body_condition, camera_condition }` |
| **GPT Vision 분석** | 사진에서 상태 판단 → enum 값 변환 |
| **기대 응답** | `vision_analysis_result` (original_value, new_value, difference), `status === "completed"` |
| **위젯** | Trade-in 위젯 — Before/After 비교 + 상태 인디케이터 |
| **호출하면 안 되는 도구** | `start_tradein_appraisal` (이미 생성됨), `check_care_plus_eligibility` (Care+ 아님) |

**로그 검증:**
```
[TOOL] analyze_tradein_device called
  args: {"appraisal_id":"appr-xxxx","vision_analysis":{"screen_condition":"no_scratches","body_condition":"minor_wear","camera_condition":"clear"}}
[TOOL] analyze_tradein_device → OK | appraisal=appr-xxxx, value=$XXX
```

---

### 턴 4-5: "이 금액으로 새 폰 살 때 적용 가능?" → "견적 수락"

| 항목 | 기대값 |
|------|--------|
| **호출 도구** | `get_tradein_result` (턴 4) |
| **파라미터** | `appraisal_id` |
| **기대 응답** | `next_steps`, `cta.text === "보상판매 제안 수락"` |
| **턴 5** | 도구 호출 없음 — 위젯 CTA로 수락 처리 |

---

## 흔한 오작동 패턴과 대응

| 오작동 | 원인 | 대응 |
|--------|------|------|
| 인사에 도구 호출 | `get_service_guidelines` 미호출 또는 guidelines 무시 | guidelines의 `greeting_response`에 인사 응대 강화 |
| 사진 없이 `check_care_plus_eligibility` 호출 | Vision 분석 없이 임의 값으로 호출 | description에 "사진 업로드 후에만 호출" 강조 |
| `search_tradein_value` 대신 `start_tradein_appraisal` 즉시 호출 | 간단 문의에 정식 견적 시작 | guidelines의 tool_flow 순서: search → appraisal |
| 국가/통신사 미수집 채로 Trade-in 호출 | description 읽지 않음 | description에 "BEFORE calling" 수집 항목 강조 (현재 적용됨) |
| `analyze_tradein_device` 호출 시 `appraisal_id` 누락 | 이전 턴의 ID를 기억 못 함 | 대화 컨텍스트에서 ID 유지 필요 — 모델 한계 |
| 파손 기기($94) → Vision 재산정($432) 역전 | region/carrier adjustment 누락 | **F-12에서 수정 완료** |
| 중복 텍스트 ("확인 중입니다" 2번) | 도구 호출 전후 같은 멘트 | guidelines의 `response_rules` + `do_not`에 명시 |
| Care+ 상담에서 `analyze_tradein_device` 호출 | UC1/UC3 혼동 | guidelines의 `step_4_call_tool`에 UC별 도구 분기 명시 |

---

## 로그 검증 체크리스트

서버 콘솔에서 `[TOOL]` 라인을 확인:

- [ ] 각 턴에서 정답지에 명시된 도구만 호출되는가?
- [ ] 필수 파라미터가 모두 포함되어 있는가?
- [ ] enum 값이 유효한가? (예: `device_condition`이 `excellent/good/fair/poor` 중 하나)
- [ ] `appraisal_id`가 이전 턴에서 생성된 ID와 일치하는가?
- [ ] Vision 분석 결과의 `screen_condition`, `body_condition`, `camera_condition`이 사진과 일관되는가?
- [ ] 도구 응답이 `ERROR`가 아닌 `OK`인가?
- [ ] 호출하면 안 되는 도구가 호출되지 않았는가?
