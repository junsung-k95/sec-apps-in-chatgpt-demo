# Samsung Galaxy MCP — Data Specification

> 이 문서는 MCP 서버가 사용하는 4개 데이터 파일의 구조와 관계를 설명합니다.
> 모든 데이터는 `server/src/data/` 디렉토리에 JSON 형태로 저장되며, 실제 엔터프라이즈 시스템의 DB 테이블을 모사합니다.

---

## 1. 데이터 파일 개요

| 파일 | 역할 | 레코드 수 | 연결된 MCP Tool |
|------|------|:---------:|-----------------|
| `devices.json` | 제품 카탈로그 + Trade-in 가격표 | 42개 기기 | `start_tradein_appraisal`, `search_tradein_value`, `list_tradein_devices` |
| `promotions.json` | 프로모션 캠페인 관리 | 22개 캠페인 | `get_promotions` |
| `plans.json` | Galaxy Club 구독 서비스 | 3개 플랜 | `get_galaxy_club_info` |
| `care_plus.json` | Samsung Care+ 보험 서비스 | 2개 플랜 | `get_care_plus_info`, `check_care_plus_eligibility` |

---

## 2. devices.json — 제품 카탈로그

### 2-1. devices (메인 테이블)

실제 시스템에서 `PRODUCT_CATALOG` 테이블에 해당합니다.

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `device_id` | PK | 기기 고유 식별자 | `DEV-SM-S926B` |
| `model` | string | 모델명 (검색 키) | `Galaxy S25 Ultra` |
| `series` | string | 시리즈 분류 | `Galaxy S`, `Galaxy Z`, `Galaxy Book` |
| `category` | enum | 카테고리 | `smartphone`, `tablet`, `watch`, `earbuds`, `notebook`, `wearable` |
| `generation` | int | 세대 번호 | `25` |
| `storage_options` | string[] | 용량 옵션 | `["256GB", "512GB", "1TB"]` |
| `base_values` | map | **Trade-in 기준가** (USD) | `{"256GB": 680, "512GB": 750}` |
| `msrp` | map | 정가 (USD) | `{"256GB": 1299}` |
| `colors` | string[] | 색상 옵션 | `["Titanium Black", ...]` |
| `release_year` | int | 출시 연도 | `2025` |
| `release_date` | date | 정확한 출시일 | `2025-01-22` |
| `end_of_support_date` | date | 지원 종료일 | `2032-01-22` |
| `status` | enum | 판매 상태 | `active` / `discontinued` |
| `trade_in_eligible` | bool | Trade-in 대상 여부 | `true` |
| `specs` | object | 상세 스펙 | display, processor, ram, battery, camera, ... |

### 기기 라인업 요약

```
Galaxy S Series ──── S25 Ultra / S25+ / S25
                     S24 Ultra / S24+ / S24
                     S23 Ultra / S23+ / S23
                     S22 Ultra / S22+ / S22

Galaxy Z Series ──── Z Fold6 / Z Flip6
                     Z Fold5 / Z Flip5
                     Z Fold4 / Z Flip4

Galaxy Tab S ─────── Tab S10 Ultra / S10+ / S10
                     Tab S9 Ultra / S9+ / S9

Galaxy Watch ─────── Watch Ultra / Watch7 / Watch7 Classic
                     Watch6 Classic / Watch6

Galaxy Buds ──────── Buds3 Pro / Buds3 / Buds2 Pro / Buds FE

Galaxy Book ──────── Book4 Ultra / Book4 Pro / Book4 Pro 360
                     Book4 360 / Book4 / Book Go

Galaxy A Series ──── A55 / A35 / A25

Galaxy Ring ──────── Ring
```

### 2-2. 보조 테이블 (Trade-in 계산용)

#### condition_multipliers — 상태별 가격 계수

| 상태 | 계수 | 설명 |
|------|:----:|------|
| `excellent` | 1.00 | 새것과 동일 |
| `good` | 0.85 | 미세한 스크래치 |
| `fair` | 0.65 | 눈에 보이는 사용감 |
| `poor` | 0.40 | 심한 파손 |

#### region_multipliers — 지역별 가격 보정

| 지역 | 계수 | 통화 | 환율 | 세금 포함 |
|------|:----:|------|:----:|:---------:|
| US | 1.00 | USD | - | N |
| KR | 0.92 | KRW | 1350 | Y |
| UK | 0.95 | GBP | 0.79 | Y |
| DE | 0.93 | EUR | 0.92 | Y |
| JP | 0.88 | JPY | 155 | Y |
| SG | 0.96 | SGD | 1.35 | Y |

#### carrier_adjustments — 통신사별 가격 조정

| 통신사 | 조정액(USD) | 비고 |
|--------|:----------:|------|
| unlocked | 0 | 자급제 |
| samsung_direct | +10 | 삼성닷컴 직구매 |
| att / verizon | -15 | 미국 통신사 |
| tmobile | -10 | 미국 통신사 |
| skt / kt / lgu | -10 | 한국 통신사 |
| docomo | -20 | 일본 통신사 |
| other_locked | -25 | 기타 잠금 |

#### Trade-in 가격 산출 공식

```
최종가 = (base_value × region_multiplier)
       + condition_adjustment
       - functional_issues_deduction
       - cosmetic_issues_deduction
       + carrier_adjustment
       + promotional_bonus
```

#### functional_issues_deductions — 기능 문제 감가

| 항목 | 감가(USD) |
|------|:--------:|
| screen_burn | -50 |
| camera_issues | -40 |
| charging_issue | -35 |
| fingerprint_sensor | -30 |
| battery_issue | -30 |
| speaker_issue / microphone | -25 |
| button_issue | -20 |
| face_recognition | -20 |
| connectivity / gps | -15 |

#### cosmetic_issues_deductions — 외관 문제 감가

| 항목 | 감가(USD) |
|------|:--------:|
| screen_cracks | -100 |
| back_cracks | -60 |
| hinge_wear (폴더블) | -40 |
| dents | -25 |
| s_pen_damage / port_damage | -20 |
| screen_scratches / discoloration / bezel | -15 |
| back_scratches | -10 |

#### vision_assessment_criteria — AI Vision 판정 기준

| 부위 | excellent | good | fair | poor |
|------|-----------|------|------|------|
| 화면 | 스크래치 없음 | 미세 스크래치 | 눈에 보이는 스크래치 | 깨짐 |
| 바디 | 완벽 | 사용 흔적 | 찍힘/스크래치 | 심한 파손 |
| 카메라 | 깨끗 | 미세 얼룩 | 스크래치 | 깨짐 |
| 힌지 | 단단/유격 없음 | 약간 흔들림 | 느슨/삐걱 | 파손/틀어짐 |

---

## 3. promotions.json — 프로모션 캠페인

실제 시스템에서 `PROMOTION_CAMPAIGN` 테이블에 해당합니다.

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | PK | 프로모션 ID | `promo-001` |
| `campaign_id` | FK | 캠페인 코드 | `CAMP-2026-Q1-S25` |
| `title` | string | 프로모션 제목 | `Galaxy S25 Ultra Launch Offer` |
| `description` | string | 상세 설명 | |
| `discount_amount` | number | 할인 금액/비율 | `200` |
| `discount_type` | enum | 할인 유형 | 아래 표 참고 |
| `eligible_devices` | string[] | 적용 대상 기기 | `["Galaxy S25", "Galaxy S25+", ...]` |
| `device_category` | enum | 카테고리 필터 | `smartphone`, `tablet`, `all`, ... |
| `target_audience` | enum | 타겟 고객군 | `all`, `student`, `enterprise`, ... |
| `status` | enum | 상태 | `active` / `expired` / `scheduled` |
| `valid_from` | date | 시작일 | `2025-01-22` |
| `valid_until` | date | 종료일 | `2026-04-30` |
| `conditions` | string[] | 적용 조건 | `["Trade-in required", ...]` |
| `stackable` | bool | 다른 프로모션과 중복 적용 가능 여부 | `true` / `false` |
| `max_redemptions` | int\|null | 최대 사용 수 (null=무제한) | `5000` |
| `current_redemptions` | int | 현재 사용 수 | `3241` |
| `priority` | int | 표시 우선순위 (1=최상위) | `1` |
| `cta_text` / `cta_url` | string | CTA 버튼 텍스트/링크 | |
| `created_at` / `updated_at` | datetime | 생성/수정 일시 | |

### discount_type 유형

| 유형 | 의미 | discount_amount 해석 |
|------|------|---------------------|
| `fixed` | 고정 금액 할인 | $200 할인 |
| `percentage` | 비율 할인 | 15% 할인 |
| `bundle` | 번들 증정 | $249 상당 제품 무료 증정 |
| `trade_in_max` | Trade-in 최대 보상 | 최대 $1200 크레딧 |
| `percentage_max` | 최대 비율 할인 | 최대 30% 할인 |
| `percentage_bonus` | Trade-in 추가 보너스 | 기존 Trade-in에 +20% |
| `subscription_credit` | 구독 크레딧 | $30 상당 구독 무료 |
| `subscription_bonus` | 구독 가입 보너스 | $150 상당 혜택 |
| `fee_waiver` | 수수료 면제 | 수수료 $0 |
| `free_program` | 무료 프로그램 | 금액 없음 |
| `enterprise` | 기업 맞춤 | 별도 협의 |

### 프로모션 카테고리 분포

```
smartphone ████████ 4개  (S25 런칭, Z Fold6 Trade-in, Z Flip6 스타일, Galaxy Club 웰컴)
notebook   ████████ 4개  (Book4 Pro BTS, Creator 번들, 360 Deal, Book Go)
all        ████████████ 7개  (에코시스템, AI 구독, AI Academy, Campus, Trade-in, Care+, Members)
tablet     ██ 1개  (Tab S10 번들)
watch      ██ 1개  (Watch7 피트니스)
earbuds    ██ 1개  (Buds3 학생)
wearable   ██ 1개  (Ring 헬스킷)
cross      ████ 3개  (MS365, Enterprise, Care+ Late)
```

---

## 4. plans.json — Galaxy Club 구독 서비스

실제 시스템에서 `SUBSCRIPTION_PLAN` + `PLAN_BENEFIT` + `PLAN_TERM` 테이블에 해당합니다.

### 4-1. 플랜 비교

| | Basic | Premium | Family |
|---|:---:|:---:|:---:|
| **월정액** | $35 | $55 | $89 |
| **연간** | $378 | $594 | $961 |
| **업그레이드 주기** | 24개월 | 12개월 | 12개월 |
| **기기 라인** | S/A/Tab | S Ultra/Z/Tab Ultra + Basic 전체 | Premium 전체 |
| **Care+ 포함** | Basic ($11.99) | Premium ($17.99) | Premium ($17.99) |
| **액세서리 번들** | X | $100/업그레이드 | $100/업그레이드 |
| **24/7 지원** | X | O | O |
| **최대 라인 수** | 1 | 1 | 4 |
| **최소 약정** | 12개월 | 12개월 | 12개월 |
| **중도 해지 수수료** | $150 | $200 | $300 |
| **바이아웃 잔존가율** | 40% | 35% | 35% |
| **가입자 수** | 48,230 | 31,450 | 12,780 |

### 4-2. 비용 비교 (cost_comparison)

Galaxy Club vs 일반 구매 절감 효과:

| 기기 | 정가 | Galaxy Club 12개월 | 절감액 | Care+ 포함 가치 |
|------|:----:|:-----------------:|:------:|:--------------:|
| S25 Ultra 256GB | $1,299 | $660 (Premium) | **$639** | +$215 |
| S25+ 256GB | $999 | $420 (Basic) | **$579** | +$144 |
| Z Fold6 256GB | $1,899 | $660 (Premium) | **$1,239** | +$215 |
| Z Flip6 256GB | $1,099 | $660 (Premium) | **$439** | +$215 |
| Tab S10 Ultra | $1,199 | $660 (Premium) | **$539** | +$215 |

### 4-3. 지역별 가격

| 지역 | Basic | Premium | Family |
|------|------:|--------:|-------:|
| US | $35 | $55 | $89 |
| KR | ₩39,900 | ₩62,900 | ₩99,900 |
| UK | £29 | £45 | £72 |
| DE | €33 | €52 | €84 |
| JP | ¥4,980 | ¥7,980 | ¥12,980 |
| SG | S$48 | S$75 | S$120 |

### 4-4. 라이프사이클

```
[가입] → [기기 수령] → [사용 (1~11개월)] → [중간 점검 (6개월)] → [업그레이드 선택 (12개월)] → [새 사이클]
  M0        M1              M1-11                 M6                      M12                   M13+
```

---

## 5. care_plus.json — Samsung Care+ 보험

실제 시스템에서 `INSURANCE_PLAN` + `CLAIM_POLICY` + `SERVICE_CENTER` 테이블에 해당합니다.

### 5-1. 플랜 비교

| | Basic | Premium |
|---|:---:|:---:|
| **월정액** | $11.99 | $17.99 |
| **연간** | $129 | $199 |
| **우발적 파손** | O (연 2회) | O (연 2회) |
| **기계적 고장** | O | O |
| **배터리 교체** | O (80% 이하) | O (80% 이하) |
| **분실/도난** | X | O (연 2회) |
| **즉시 교체** | X | O (익일 배송) |
| **화면 수리 자기부담금** | $29 | **$0** |
| **기타 수리 자기부담금** | $99 | $49 |
| **교체 자기부담금** | - | $149 |
| **분실 교체 자기부담금** | - | $249 |
| **힌지 수리 (폴더블)** | X | O ($0) |
| **해외 서비스** | X | O |
| **24/7 전용 상담** | X | O |
| **연간 보장 한도** | $2,500 | $5,000 |
| **폴더블 기기 가입** | X | O |

### 5-2. 기기별 월 보험료

| 카테고리 | 대표 기기 | Basic | Premium |
|----------|----------|------:|--------:|
| 플래그십 스마트폰 | S25 Ultra, S24 Ultra | $11.99 | $17.99 |
| 일반 스마트폰 | S25, A55, A35 | $8.99 | $13.99 |
| 폴더블 | Z Fold6, Z Flip6 | N/A | $17.99 |
| 태블릿 | Tab S10 Ultra, Tab S9 | $7.99 | $12.99 |
| 워치 | Watch Ultra, Watch7 | $3.99 | $5.99 |
| 이어버즈 | Buds3 Pro, Buds3 | $2.99 | $4.99 |
| 노트북 | Book4 Ultra, Book4 Pro | $9.99 | $14.99 |

### 5-3. 가입 규칙

```
구매일 기준 타임라인:

|<────── 60일 ──────>|<──────────── 60일~365일 ──────────────>|
|   일반 가입 (즉시)   |          Late Enrollment              |
|   조건 검사 없음     |   Vision 기반 컨디션 검사 필요          |
|   수수료 없음        |   수수료 $49 (프로모션 시 면제 가능)     |
```

### 5-4. Late Enrollment — Vision 검사 프로세스

```
사진 업로드 → AI Vision 분석 → 판정
    │              │              │
    │         ┌────┴────┐    ┌───┴───┐
    │         │ 화면    │    │ 통과   │ → 즉시 가입 승인
    │         │ 바디    │    │ (good  │
    │         │ 카메라  │    │  이상) │
    │         └────┬────┘    ├───────┤
    │              │         │ 불합격 │ → 서비스센터 방문 검사 권장
    │              │         │ (fair  │
    │              │         │  이하) │
    │              │         └───────┘
  앞면 + 뒷면
```

### 5-5. 클레임 프로세스

```
① 클레임 접수 ─→ ② 접수 확인 (30분) ─→ ③ 수리/교체 진행 ─→ ④ 완료 수령
   (앱/웹/전화)                            (택배/방문/즉시교체)    (3~5일)
```

---

## 6. 데이터 관계도 (ERD 개요)

```
┌─────────────────┐     참조      ┌──────────────────┐
│   devices.json  │◄────────────── │ promotions.json  │
│  (제품 카탈로그)  │  eligible_    │  (프로모션 캠페인) │
│                 │  devices      │                  │
│  42개 기기       │               │  22개 캠페인      │
└────────┬────────┘               └──────────────────┘
         │
         │ 가격 참조                    참조
         ▼                              │
┌─────────────────┐     Care+ 포함   ┌──┴───────────────┐
│  plans.json     │────────────────►│ care_plus.json   │
│  (Galaxy Club)  │                 │  (Samsung Care+) │
│                 │                 │                  │
│  3개 플랜        │  cost_comparison│  2개 플랜         │
│                 │  에서 msrp 참조  │                  │
└─────────────────┘                 └──────────────────┘
```

---

## 7. 데모 시나리오별 데이터 매핑

| 시나리오 | 사용 데이터 | 핵심 흐름 |
|----------|-----------|----------|
| **UC1: Care+ Late Enrollment** | `care_plus.json` → `devices.json` (vision 검사) | 가입 가능 여부 확인 → Vision 사진 분석 → 플랜 비교 → 가입 |
| **UC2: Galaxy Club 상담** | `plans.json` → `devices.json` (msrp) → `care_plus.json` | 플랜 비교 → 비용 절감 시뮬레이션 → Trade-in 비교 → 가입 |
| **UC3: Trade-in 카메라 견적** | `devices.json` (base_values + 모든 보조 테이블) | 기기 검색 → 초기 견적 → Vision 사진 분석 → 최종 가격 |
