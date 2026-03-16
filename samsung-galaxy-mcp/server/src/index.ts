import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { z } from "zod";

// Import mock data
import plansData from "./data/plans.json" with { type: "json" };
import devicesData from "./data/devices.json" with { type: "json" };
import carePlusData from "./data/care_plus.json" with { type: "json" };

// Import widget HTML generators
import { getGalaxyClubWidgetHtml } from "./widgets/galaxyClubWidget.js";
import { getTradeinWidgetHtml } from "./widgets/tradeinWidget.js";
import { getCarePlusWidgetHtml } from "./widgets/carePlusWidget.js";
import { getComparisonWidgetHtml } from "./widgets/comparisonWidget.js";

// Widget CSP configuration
const WIDGET_DOMAIN = "https://deflagrable-slackingly-geralyn.ngrok-free.dev";
const WIDGET_CSP = {
  connectDomains: [WIDGET_DOMAIN],
  resourceDomains: [WIDGET_DOMAIN, "https://*.oaistatic.com"],
};

// In-memory store for appraisals
const appraisalStore: Map<string, any> = new Map();

function generateAppraisalId(): string {
  return `appr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function createSamsungServer(): McpServer {
  const server = new McpServer({
    name: "samsung-galaxy-services",
    version: "1.0.0",
  });

  // ============================================
  // REGISTER UI RESOURCES (Widget Templates)
  // ============================================

  // Galaxy Club Widget
  registerAppResource(
    server,
    "galaxy-club-widget",
    "ui://widget/galaxy-club.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/galaxy-club.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: getGalaxyClubWidgetHtml(),
          _meta: {
            ui: {
              prefersBorder: true,
              domain: WIDGET_DOMAIN,
              csp: WIDGET_CSP,
            },
          },
        },
      ],
    })
  );

  // Trade-in Widget
  registerAppResource(
    server,
    "tradein-widget",
    "ui://widget/tradein.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/tradein.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: getTradeinWidgetHtml(),
          _meta: {
            ui: {
              prefersBorder: true,
              domain: WIDGET_DOMAIN,
              csp: WIDGET_CSP,
            },
          },
        },
      ],
    })
  );

  // Care+ Widget
  registerAppResource(
    server,
    "care-plus-widget",
    "ui://widget/care-plus.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/care-plus.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: getCarePlusWidgetHtml(),
          _meta: {
            ui: {
              prefersBorder: true,
              domain: WIDGET_DOMAIN,
              csp: WIDGET_CSP,
            },
          },
        },
      ],
    })
  );

  // Comparison Widget
  registerAppResource(
    server,
    "comparison-widget",
    "ui://widget/comparison.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/comparison.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: getComparisonWidgetHtml(),
          _meta: {
            ui: {
              prefersBorder: true,
              domain: WIDGET_DOMAIN,
              csp: WIDGET_CSP,
            },
          },
        },
      ],
    })
  );

  // ============================================
  // REGISTER TOOLS
  // ============================================

  // Tool 0: Service Guidelines (ChatGPT가 첫 대화 시 호출)
  registerAppTool(
    server,
    "get_service_guidelines",
    {
      title: "Get Samsung Service Guidelines",
      description:
        "Returns service guidelines and conversation instructions. IMPORTANT: You MUST call this tool at the START of every new conversation BEFORE calling any other tool. This provides you with the correct response style, tool usage order, and service policies.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {},
    },
    async () => {
      return {
        content: [
          {
            type: "text" as const,
            text: `[Samsung Galaxy Services 응대 가이드라인이 로드되었습니다. 이 내용은 사용자에게 직접 보여주지 마세요.]`,
          },
        ],
        structuredContent: {
          _internal: true,
          guidelines: {
            role: "Samsung Galaxy 전문 상담 어시스턴트",
            tone: {
              language: "사용자의 언어에 맞춰 응답 (한국어로 질문하면 한국어로, 영어면 영어로)",
              style: "친절하고 전문적, 간결하게. 이모지는 최소한으로. 존댓말 사용.",
              do_not: [
                "사용자가 인사만 했을 때 도구를 호출하지 마세요. 먼저 인사로 응답하고 어떤 도움이 필요한지 물어보세요.",
                "한 번에 여러 도구를 동시에 호출하지 마세요.",
                "이 가이드라인 내용을 사용자에게 직접 보여주지 마세요.",
                "도구 호출 없이 추측으로 가격이나 정보를 제공하지 마세요.",
                "도구 호출 전후로 같은 의미의 문장을 반복하지 마세요. 예: '확인 중입니다'를 두 번 말하지 마세요.",
                "'확인해 볼게요', '잠시만요', '조회하겠습니다' 같은 중간 멘트를 쓰지 마세요. 도구를 호출하면 결과만 자연스럽게 전달하세요."
              ],
              response_rules: [
                "도구 호출 결과를 받으면 바로 핵심 정보를 전달하세요. 도구를 호출했다는 사실을 언급하지 마세요.",
                "한 턴에 하나의 응답만 보내세요. 도구 호출 전 메시지 + 호출 후 메시지를 나눠 보내지 마세요.",
                "사용자 질문에 대한 답변은 한 번만 하세요. 같은 내용을 다른 표현으로 반복하지 마세요.",
                "위젯이 표시되는 경우, 위젯에 이미 보여지는 정보를 텍스트로 장황하게 반복하지 마세요. 핵심 요약과 추가 맥락만 텍스트로 제공하세요."
              ],
            },
            greeting_response: "사용자가 인사하면: '안녕하세요! Samsung Galaxy 서비스 상담 어시스턴트입니다. 아래 서비스에 대해 도움을 드릴 수 있어요:\\n\\n• **Samsung Care+** — 기기 보험 및 보호 서비스\\n• **New Galaxy Club** — 구독형 기기 업그레이드 프로그램\\n• **보상판매 (Trade-in)** — 기존 기기 보상판매 견적\\n\\n어떤 서비스에 대해 알아보시겠어요?'",
            services: {
              care_plus: {
                name: "Samsung Care+",
                description: "기기 보험 서비스. Late Enrollment (구매 60일~1년) 시 Vision 검사 지원.",
                tool_flow: [
                  "1. get_care_plus_info — 플랜 정보 및 가입 가능 여부 확인",
                  "2. (Late Enrollment 시) 사용자에게 기기 사진 업로드 요청",
                  "3. check_care_plus_eligibility — Vision 분석 결과로 적격성 판단"
                ],
                required_info: ["기기 모델명", "구매 시기 (대략적인 날짜)"],
                conversation_example: "사용자: 'Care+에 가입하고 싶어요' → 기기 모델과 구매 시기 물어보기 → get_care_plus_info 호출"
              },
              galaxy_club: {
                name: "New Galaxy Club",
                description: "구독형 기기 업그레이드 프로그램. 비용 비교 기능 제공.",
                tool_flow: [
                  "1. get_galaxy_club_info — 플랜 소개",
                  "2. compare_galaxy_club_cost — 일반 구매 대비 비용 비교 (사용자가 원할 때)",
                ],
                required_info: ["관심 기기 모델 (비교 시)", "현재 사용 기기 (Trade-in 비교 시)"],
                conversation_example: "사용자: 'Galaxy Club이 뭐예요?' → get_galaxy_club_info 호출 → 사용자가 비교 원하면 compare_galaxy_club_cost 호출"
              },
              trade_in: {
                name: "보상판매 (Trade-in)",
                description: "기존 기기 보상판매 견적. Vision 분석으로 정확한 재산정 지원.",
                tool_flow: [
                  "1. search_tradein_value — 먼저 가격 범위 조회 (간단 문의 시)",
                  "2. start_tradein_appraisal — 정식 견적 시작 (아래 정보 모두 수집 후)",
                  "3. 사용자에게 기기 사진 업로드 요청 ('더 정확한 견적을 위해 기기 앞면/뒷면 사진을 올려주세요')",
                  "4. analyze_tradein_device — Vision 분석 결과로 재산정",
                  "5. get_tradein_result — 최종 결과 조회"
                ],
                required_info_for_appraisal: {
                  must_collect_before_calling: "start_tradein_appraisal",
                  items: [
                    "기기 모델명 — '어떤 기기를 보상판매하시려고요?'",
                    "저장 용량 — '저장 용량이 어떻게 되나요? (예: 256GB)'",
                    "국가/지역 — '어느 나라에서 구매하신 기기인가요?'",
                    "통신사 — '자급제(언락)인가요, 통신사 약정 기기인가요?'",
                    "전반적 상태 — '기기의 전반적인 상태는 어떤가요? (새것 같음 / 미세 스크래치 / 눈에 띄는 스크래치 / 심한 파손)'",
                    "기능 문제 유무 — '배터리, 충전, 스피커 등 기능 문제가 있나요?'",
                    "외관 문제 유무 — '화면 깨짐, 찍힘 등 외관 문제가 있나요?'"
                  ],
                },
                conversation_example: "사용자: 'S23 Ultra 보상판매 얼마?' → 국가/통신사 물어보기 → search_tradein_value 호출 → 정식 견적 원하면 나머지 정보 수집 후 start_tradein_appraisal"
              }
            },
            vision_photo_guide: {
              when: "사용자가 기기 사진을 업로드했을 때",
              how: "Vision으로 사진을 분석하여 screen_condition, body_condition, camera_condition을 판단 후 해당 도구 호출",
              criteria: {
                screen: "no_scratches(깨끗) / light_scratches(미세) / visible_scratches(눈에 보임) / cracked(깨짐)",
                body: "pristine(새것) / minor_wear(미세 흔적) / dents_scratches(찍힘) / major_damage(심한 파손)",
                camera: "clear(깨끗) / minor_smudge(얼룩) / scratched(스크래치) / cracked(깨짐)"
              }
            },
            cross_sell_rules: [
              "Trade-in 완료 후 → Galaxy Club 안내 ('Galaxy Club으로 가입하면 매년 최신 기기를 쓸 수 있어요')",
              "Galaxy Club 상담 시 → Care+ 포함 혜택 강조",
              "Care+ 상담 시 → Galaxy Club에 Care+가 이미 포함되어 있다는 정보 제공"
            ],
          },
        },
      };
    }
  );

  // Tool 1: Get Galaxy Club Info
  registerAppTool(
    server,
    "get_galaxy_club_info",
    {
      title: "Get Galaxy Club Info",
      description:
        "Returns detailed information about New Galaxy Club subscription plans including pricing, benefits, device options, and terms. Use this when customers ask about Galaxy Club, Samsung device subscription, monthly device plans, or how to always have the latest Galaxy device.",
      inputSchema: {
        plan_type: z
          .enum(["basic", "premium", "family", "all"])
          .optional()
          .describe("Specific plan to get info about, or 'all' for comparison"),
        device_interest: z
          .string()
          .optional()
          .describe("Device the customer is interested in, to highlight relevant plans"),
        include_faq: z
          .boolean()
          .optional()
          .describe("Whether to include FAQ section"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/galaxy-club.html" },
        "openai/outputTemplate": "ui://widget/galaxy-club.html",
      },
    },
    async (args) => {
      const { plan_type, device_interest, include_faq } = args;

      let filteredPlans = [...plansData.plans];
      const faqs = include_faq !== false ? plansData.faq : [];

      // Filter by plan type
      if (plan_type && plan_type !== "all") {
        const planIdPrefix = `ngc-${plan_type}`;
        filteredPlans = filteredPlans.filter((p: any) => p.id === planIdPrefix);
      }

      // Determine recommended plan based on device interest
      let recommendedPlanId: string | null = null;
      if (device_interest) {
        const deviceLower = device_interest.toLowerCase();
        const isPremiumDevice =
          deviceLower.includes("ultra") ||
          deviceLower.includes("fold") ||
          deviceLower.includes("flip");
        recommendedPlanId = isPremiumDevice ? "ngc-premium" : "ngc-basic";
      }

      const plansSummary = filteredPlans
        .map((p: any) => `**${p.name}**: $${p.monthly_price}/month - Upgrade every ${p.upgrade_cycle_months} months`)
        .join("\n");

      return {
        content: [
          {
            type: "text" as const,
            text: `# ${plansData.service_name}\n\n${plansData.tagline}\n\n## Available Plans\n${plansSummary}`,
          },
        ],
        structuredContent: {
          service_name: plansData.service_name,
          tagline: plansData.tagline,
          description: plansData.description,
          plans: filteredPlans.map((p: any) => ({
            ...p,
            is_recommended: p.id === recommendedPlanId,
          })),
          faq: faqs,
          enrollment_steps: (plansData.enrollment_steps as any[]).map((s: any) =>
            typeof s === "string" ? s : s.description ?? s.title
          ),
          recommended_plan_id: recommendedPlanId,
          lifecycle_stages: (plansData as any).lifecycle?.stages || [],
          regional_pricing: (plansData as any).regional_pricing || null,
          available_regions: (plansData as any).available_regions || [],
        },
      };
    }
  );

  // Tool 3: Start Trade-in Appraisal
  registerAppTool(
    server,
    "start_tradein_appraisal",
    {
      title: "Start Trade-in Appraisal",
      description:
        `Initiates a trade-in appraisal for a Samsung Galaxy device. Returns an initial value estimate.

BEFORE calling this tool, you MUST collect the following information from the user through conversation:

1. **기기 모델명** — "어떤 기기를 보상판매하시려고요?" (예: Galaxy S23 Ultra, Galaxy Z Fold5)
2. **저장 용량** — "저장 용량이 어떻게 되시나요?" (예: 128GB, 256GB, 512GB, 1TB)
3. **전반적인 상태** — "기기의 전반적인 상태는 어떤가요?" 아래 중 하나를 선택하도록 안내:
   - excellent: 새것과 거의 동일, 스크래치/파손 없음
   - good: 정상 사용 흔적, 미세한 스크래치만 있음
   - fair: 눈에 보이는 스크래치/찍힘, 약간의 사용감
   - poor: 심한 파손, 화면 깨짐, 큰 찍힘
4. **기능 문제** (선택) — "혹시 기능적으로 문제가 있나요?" 해당 항목 선택:
   - battery_issue: 배터리 소모가 비정상적으로 빠름
   - charging_issue: 충전 불량
   - speaker_issue: 스피커/마이크 문제
   - button_issue: 버튼 작동 불량
   - connectivity_issue: Wi-Fi/블루투스 연결 문제
5. **외관 문제** (선택) — "외관상 눈에 띄는 문제가 있나요?"
   - screen_scratches: 화면 스크래치
   - screen_cracks: 화면 깨짐
   - back_scratches: 후면 스크래치
   - back_cracks: 후면 깨짐
   - dents: 찍힘/함몰
   - discoloration: 변색

모든 정보를 수집한 후 이 도구를 호출하세요. 초기 견적 제공 후, 사용자에게 "더 정확한 견적을 위해 기기의 앞면/뒷면 사진을 대화창에 업로드해 주세요"라고 안내하세요.`,
      inputSchema: {
        device_model: z.string().describe("기기 모델명 (예: 'Galaxy S23 Ultra', 'Galaxy Z Fold5')"),
        storage_capacity: z.string().optional().describe("저장 용량 (예: '128GB', '256GB', '512GB', '1TB')"),
        device_condition: z
          .enum(["excellent", "good", "fair", "poor"])
          .describe("전반적 상태: excellent(새것 같음), good(미세 스크래치), fair(눈에 보이는 스크래치), poor(심한 파손)"),
        functional_issues: z
          .array(z.string())
          .optional()
          .describe("기능 문제 목록: battery_issue, charging_issue, speaker_issue, button_issue, connectivity_issue"),
        cosmetic_issues: z
          .array(z.string())
          .optional()
          .describe("외관 문제 목록: screen_scratches, screen_cracks, back_scratches, back_cracks, dents, discoloration"),
        region: z
          .enum(["US", "KR", "UK", "DE", "JP", "SG"])
          .optional()
          .describe("국가/지역: US(미국), KR(한국), UK(영국), DE(독일), JP(일본), SG(싱가포르)"),
        carrier: z
          .enum(["unlocked", "samsung_direct", "att", "verizon", "tmobile", "skt", "kt", "lgu", "docomo", "other_locked"])
          .optional()
          .describe("통신사/잠금 상태"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/tradein.html" },
        "openai/outputTemplate": "ui://widget/tradein.html",
      },
    },
    async (args) => {
      const {
        device_model,
        storage_capacity,
        device_condition,
        functional_issues = [],
        cosmetic_issues = [],
        region = "US",
        carrier = "unlocked",
      } = args;

      // Find device in database - prioritize exact matches
      const modelLower = device_model.toLowerCase().trim();
      let device = devicesData.devices.find(
        (d: any) => d.model.toLowerCase() === modelLower
      );

      // If no exact match, try matching with "galaxy" prefix
      if (!device) {
        device = devicesData.devices.find(
          (d: any) => d.model.toLowerCase() === `galaxy ${modelLower}`
        );
      }

      // If still no match, try partial match but prefer shorter/exact model names
      if (!device) {
        const candidates = devicesData.devices.filter(
          (d: any) => d.model.toLowerCase().includes(modelLower)
        );
        candidates.sort((a: any, b: any) => a.model.length - b.model.length);
        device = candidates[0];
      }

      if (!device) {
        return {
          content: [
            {
              type: "text" as const,
              text: `"${device_model}"을(를) 보상판매 데이터베이스에서 찾을 수 없습니다.`,
            },
          ],
          structuredContent: {
            error: "device_not_found",
            searched_model: device_model,
            supported_devices: devicesData.devices.map((d: any) => d.model),
          },
        };
      }

      // Determine storage
      const storage = storage_capacity ?? device.storage_options[0];
      const baseValues = device.base_values as unknown as Record<string, number>;
      const baseValue = baseValues[storage] ?? Object.values(baseValues)[0] ?? 0;

      // Calculate valuation
      const conditionMultiplier = (devicesData.condition_multipliers as any)[device_condition];
      const conditionAdjustment = Math.round(baseValue * (conditionMultiplier - 1));

      // Calculate issues deduction
      let issuesDeduction = 0;
      for (const issue of functional_issues) {
        issuesDeduction += (devicesData.functional_issues_deductions as any)[issue] ?? 0;
      }
      for (const issue of cosmetic_issues) {
        issuesDeduction += (devicesData.cosmetic_issues_deductions as any)[issue] ?? 0;
      }

      // Region & carrier adjustments
      const regionData = (devicesData as any).region_multipliers[region] || (devicesData as any).region_multipliers["US"];
      const carrierData = (devicesData as any).carrier_adjustments[carrier] || (devicesData as any).carrier_adjustments["unlocked"];
      const regionAdjusted = Math.round(baseValue * regionData.multiplier);
      const regionAdjustment = regionAdjusted - baseValue;
      const carrierAdjustment = carrierData.adjustment;

      // Promotional bonus
      const promo = devicesData.current_promotional_bonus;
      const eligibleForBonus = promo.eligible_categories.includes(device.category);
      const promotionalBonus = eligibleForBonus ? promo.amount : 0;

      const finalValue = Math.max(0, regionAdjusted + conditionAdjustment - issuesDeduction + carrierAdjustment + promotionalBonus);

      // Create appraisal
      const appraisalId = generateAppraisalId();
      const now = new Date();
      const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const appraisal = {
        appraisal_id: appraisalId,
        device: { model: device.model, storage },
        condition: device_condition,
        region: { code: region, label: regionData.label },
        carrier: { code: carrier, label: carrierData.label },
        functional_issues,
        cosmetic_issues,
        images: [],
        valuation: {
          base_value: baseValue,
          region_adjustment: regionAdjustment,
          carrier_adjustment: carrierAdjustment,
          condition_adjustment: conditionAdjustment,
          issues_deduction: -issuesDeduction,
          promotional_bonus: promotionalBonus,
          final_value: finalValue,
          currency: "USD",
        },
        created_at: now.toISOString(),
        valid_until: validUntil.toISOString(),
        status: "pending_images",
      };

      appraisalStore.set(appraisalId, appraisal);

      const conditionDesc = (devicesData.condition_descriptions as any)[device_condition];

      return {
        content: [
          {
            type: "text" as const,
            text: `${device.model} (${storage}) 보상판매 견적이 시작되었습니다.\n\n**예상 보상가: $${finalValue}**\n\n상태: ${device_condition} - ${conditionDesc}\n\n이 견적은 7일간 유효합니다. 더 정확한 견적을 위해 기기 사진을 업로드해 주세요.`,
          },
        ],
        structuredContent: {
          appraisal_id: appraisalId,
          device: appraisal.device,
          condition: device_condition,
          condition_description: conditionDesc,
          valuation: {
            ...appraisal.valuation,
            breakdown: {
              base: `$${baseValue}`,
              region: regionAdjustment !== 0 ? `${regionAdjustment >= 0 ? "+" : ""}$${regionAdjustment} (${regionData.label})` : null,
              carrier: carrierAdjustment !== 0 ? `${carrierAdjustment >= 0 ? "+" : ""}$${carrierAdjustment} (${carrierData.label})` : null,
              condition: `${conditionAdjustment >= 0 ? "+" : ""}$${conditionAdjustment}`,
              issues: `${-issuesDeduction >= 0 ? "+" : ""}$${-issuesDeduction}`,
              bonus: promotionalBonus > 0 ? `+$${promotionalBonus} (${promo.description})` : null,
              total: `$${finalValue}`,
            },
          },
          region: appraisal.region,
          carrier: appraisal.carrier,
          valid_until: appraisal.valid_until,
          status: "pending_images",
          next_step: "기기 사진을 업로드하여 견적을 확정하세요",
        },
      };
    }
  );

  // Tool 4: Submit Trade-in Images
  registerAppTool(
    server,
    "submit_tradein_images",
    {
      title: "Submit Trade-in Images",
      description:
        "Submits device images for a trade-in appraisal. When user uploads device photos, use YOUR VISION capability to analyze the images first: identify the device model (e.g., Galaxy S24, S23 Ultra) and assess the condition (scratches, cracks, screen damage). Then call this tool with the analysis results. This allows accurate trade-in pricing based on actual device condition.",
      inputSchema: {
        appraisal_id: z.string().describe("The appraisal ID from start_tradein_appraisal"),
        front_image: z.string().optional().describe("Photo of the device front/screen"),
        back_image: z.string().optional().describe("Photo of the device back"),
        screen_image: z.string().optional().describe("Photo of screen with display on (to check for burn-in/damage)"),
        damage_image: z.string().optional().describe("Photo of any damage areas"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/tradein.html" },
        "openai/outputTemplate": "ui://widget/tradein.html",
      },
    },
    async (args) => {
      const { appraisal_id, front_image, back_image, screen_image, damage_image } = args;

      const appraisal = appraisalStore.get(appraisal_id);
      if (!appraisal) {
        return {
          content: [
            {
              type: "text" as const,
              text: `견적을 찾을 수 없습니다: ${appraisal_id}. 새로운 견적을 시작해 주세요.`,
            },
          ],
          structuredContent: { error: "appraisal_not_found", appraisal_id },
        };
      }

      // Collect submitted images
      const images: Array<{ type: string; file_id: string }> = [];
      if (front_image) images.push({ type: "front", file_id: front_image });
      if (back_image) images.push({ type: "back", file_id: back_image });
      if (screen_image) images.push({ type: "screen", file_id: screen_image });
      if (damage_image) images.push({ type: "damage", file_id: damage_image });

      appraisal.images = images;
      const imageTypes = images.map((i) => i.type);
      const hasAllRequiredImages = imageTypes.includes("front") && imageTypes.includes("back");

      appraisal.status = hasAllRequiredImages ? "completed" : "processing";
      appraisalStore.set(appraisal_id, appraisal);

      const missingImages: string[] = [];
      if (!front_image) missingImages.push("front");
      if (!back_image) missingImages.push("back");

      return {
        content: [
          {
            type: "text" as const,
            text: `견적 ${appraisal_id}에 ${images.length}장의 이미지를 수신했습니다.\n\n${
              hasAllRequiredImages
                ? "✓ 필수 이미지가 모두 수신되었습니다! 견적이 완료되었습니다."
                : `⚠️ 필수 사진 누락: ${missingImages.join(", ")}. 견적 완료를 위해 업로드해 주세요.`
            }`,
          },
        ],
        structuredContent: {
          appraisal_id,
          images_received: images.length,
          image_types: imageTypes,
          missing_images: missingImages,
          status: appraisal.status,
          valuation: appraisal.valuation,
        },
      };
    }
  );

  // Tool 5: Get Trade-in Result
  registerAppTool(
    server,
    "get_tradein_result",
    {
      title: "Get Trade-in Result",
      description:
        "Retrieves the final trade-in appraisal result including the value estimate, condition assessment, and next steps.",
      inputSchema: {
        appraisal_id: z.string().describe("The appraisal ID to get results for"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/tradein.html" },
        "openai/outputTemplate": "ui://widget/tradein.html",
      },
    },
    async (args) => {
      const { appraisal_id } = args;

      const appraisal = appraisalStore.get(appraisal_id);
      if (!appraisal) {
        return {
          content: [
            {
              type: "text" as const,
              text: `견적을 찾을 수 없습니다: ${appraisal_id}.`,
            },
          ],
          structuredContent: { error: "appraisal_not_found", appraisal_id },
        };
      }

      const nextSteps =
        appraisal.status === "completed"
          ? [
              "보상판매 제안을 수락하세요",
              "무료 선불 라벨로 기기를 발송하세요",
              "3~5 영업일 내 크레딧을 받으세요",
            ]
          : [
              "기기 사진을 업로드하세요 (앞면/뒷면 필수)",
              "이미지 분석이 완료될 때까지 기다려주세요",
              "최종 견적을 확인하고 수락하세요",
            ];

      return {
        content: [
          {
            type: "text" as const,
            text: `## 보상판매 견적 결과\n\n**기기:** ${appraisal.device.model} (${appraisal.device.storage})\n**상태:** ${appraisal.status}\n**최종 보상가: $${appraisal.valuation.final_value}**`,
          },
        ],
        structuredContent: {
          appraisal_id: appraisal.appraisal_id,
          device: appraisal.device,
          condition: appraisal.condition,
          valuation: appraisal.valuation,
          valid_until: appraisal.valid_until,
          status: appraisal.status,
          next_steps: nextSteps,
          cta: {
            text: appraisal.status === "completed" ? "보상판매 제안 수락" : "기기 사진 업로드",
            action: appraisal.status === "completed" ? "accept_tradein" : "upload_images",
          },
        },
      };
    }
  );

  // Tool 6: Search Trade-in Value
  registerAppTool(
    server,
    "search_tradein_value",
    {
      title: "Search Trade-in Value",
      description:
        `Searches trade-in value for a specific Samsung Galaxy device. Use this when customers ask how much their device is worth BEFORE starting a formal appraisal.

BEFORE calling this tool, collect the following from the user:

1. **기기 모델명** (필수) — "어떤 기기를 보상판매하시려고요?" (예: Galaxy S24 Ultra, Galaxy Z Fold5, Galaxy Tab S9)
2. **저장 용량** (선택) — "저장 용량이 어떻게 되나요?" (예: 128GB, 256GB, 512GB, 1TB)
3. **국가/지역** (필수) — "어느 나라에서 구매하신 기기인가요?" 가격 정책이 국가별로 다릅니다:
   - US: 미국
   - KR: 한국
   - UK: 영국
   - DE: 독일
   - JP: 일본
   - SG: 싱가포르
4. **통신사/잠금 상태** (필수) — "자급제(언락) 기기인가요, 통신사 약정 기기인가요?"
   - unlocked: 자급제 (언락)
   - samsung_direct: 삼성닷컴 직접 구매
   - att / verizon / tmobile: 미국 통신사
   - skt / kt / lgu: 한국 통신사
   - docomo: 일본 통신사
   - other_locked: 기타 통신사 잠금

검색 결과로 해당 기기의 예상 보상판매 가격 범위를 반환합니다. 정식 견적은 start_tradein_appraisal로 진행하세요.`,
      inputSchema: {
        query: z.string().describe("기기 모델명 또는 키워드 (예: 'S24 Ultra', 'Z Fold5', 'Tab S9')"),
        storage_capacity: z.string().optional().describe("저장 용량 (예: '256GB')"),
        region: z
          .enum(["US", "KR", "UK", "DE", "JP", "SG"])
          .describe("국가/지역 코드: US(미국), KR(한국), UK(영국), DE(독일), JP(일본), SG(싱가포르)"),
        carrier: z
          .enum(["unlocked", "samsung_direct", "att", "verizon", "tmobile", "skt", "kt", "lgu", "docomo", "other_locked"])
          .describe("통신사/잠금 상태: unlocked(자급제), samsung_direct(삼성닷컴), att/verizon/tmobile(미국), skt/kt/lgu(한국), docomo(일본), other_locked(기타)"),
        category: z
          .enum(["smartphone", "tablet", "watch", "earbuds"])
          .optional()
          .describe("기기 카테고리 필터"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: ["model", "app"] },
      },
    },
    async (args) => {
      const { query, storage_capacity, region, carrier, category } = args;
      const queryLower = query.toLowerCase().trim();

      // Search devices by query — only trade-in eligible
      let matches = devicesData.devices.filter((d: any) => {
        if (d.trade_in_eligible === false) return false;
        const modelLower = d.model.toLowerCase();
        const queryMatch = modelLower.includes(queryLower) || queryLower.includes(modelLower.replace("galaxy ", ""));
        const categoryMatch = !category || d.category === category;
        return queryMatch && categoryMatch;
      });

      if (matches.length === 0) {
        // Fuzzy: try matching individual words
        const words = queryLower.split(/\s+/);
        matches = devicesData.devices.filter((d: any) => {
          const modelLower = d.model.toLowerCase();
          return words.every((w: string) => modelLower.includes(w));
        });
      }

      if (matches.length === 0) {
        return {
          content: [{ type: "text" as const, text: `"${query}"에 해당하는 기기를 찾을 수 없습니다. 정확한 Samsung Galaxy 모델명을 입력해 주세요.` }],
          structuredContent: {
            error: "no_results",
            query,
            suggestion: "Galaxy S24 Ultra, Galaxy Z Fold5, Galaxy Tab S9 등의 모델명으로 검색해 주세요.",
          },
        };
      }

      // Apply region & carrier adjustments
      const regionData = (devicesData as any).region_multipliers[region] || (devicesData as any).region_multipliers["US"];
      const carrierData = (devicesData as any).carrier_adjustments[carrier] || (devicesData as any).carrier_adjustments["unlocked"];
      const promo = devicesData.current_promotional_bonus;

      const results = matches.map((device: any) => {
        const baseValues = device.base_values as Record<string, number>;

        // If specific storage requested, show only that
        let storageEntries: Array<{ storage: string; value: number }>;
        if (storage_capacity && baseValues[storage_capacity]) {
          storageEntries = [{ storage: storage_capacity, value: baseValues[storage_capacity] }];
        } else {
          storageEntries = Object.entries(baseValues).map(([s, v]) => ({ storage: s, value: v as number }));
        }

        const eligibleForBonus = promo.eligible_categories.includes(device.category);
        const promoBonus = eligibleForBonus ? promo.amount : 0;

        const valuations = storageEntries.map(({ storage, value }) => {
          const regionAdjusted = Math.round(value * regionData.multiplier);
          const carrierAdjusted = regionAdjusted + carrierData.adjustment;
          const withPromo = carrierAdjusted + promoBonus;

          // Convert to local currency if not USD
          let localValue: number | null = null;
          let localCurrency: string | null = null;
          if (region !== "US" && regionData.base_rate) {
            if (region === "KR") {
              localValue = Math.round(withPromo * regionData.base_rate);
              localCurrency = `${localValue}${regionData.currency_symbol}`;
            } else {
              localValue = Math.round(withPromo * regionData.base_rate);
              localCurrency = `${regionData.currency} ${localValue}`;
            }
          }

          return {
            storage,
            base_value_usd: value,
            region_adjusted: regionAdjusted,
            carrier_adjustment: carrierData.adjustment,
            promotional_bonus: promoBonus,
            estimated_value_usd: withPromo,
            local_value: localCurrency,
            condition_range: {
              excellent: withPromo,
              good: Math.round(withPromo * 0.85),
              fair: Math.round(withPromo * 0.65),
              poor: Math.round(withPromo * 0.40),
            },
          };
        });

        return {
          model: device.model,
          category: device.category,
          release_year: device.release_year,
          valuations,
        };
      });

      // Build text summary
      const summaryLines = results.map((r: any) => {
        const vals = r.valuations.map((v: any) =>
          `  - ${v.storage}: $${v.condition_range.poor}~$${v.condition_range.excellent}${v.local_value ? ` (${v.local_value})` : ""}`
        ).join("\n");
        return `**${r.model}** (${r.release_year})\n${vals}`;
      });

      return {
        content: [{
          type: "text" as const,
          text: `## 보상판매 가격 조회 결과\n\n지역: ${regionData.label} | 통신사: ${carrierData.label}\n\n${summaryLines.join("\n\n")}${promo ? `\n\n🎁 프로모션: ${promo.description} (+$${promo.amount})` : ""}`,
        }],
        structuredContent: {
          results,
          search_params: {
            query,
            region: { code: region, label: regionData.label },
            carrier: { code: carrier, label: carrierData.label },
          },
          promotional_bonus: promo,
        },
      };
    }
  );

  // ============================================
  // NEW TOOLS (UC1, UC2, UC3)
  // ============================================

  // Tool 7: Get Care+ Info (UC1)
  registerAppTool(
    server,
    "get_care_plus_info",
    {
      title: "Get Samsung Care+ Info",
      description:
        "Returns Samsung Care+ insurance plan information, coverage details, and enrollment eligibility. Use this when customers ask about Samsung Care+, device insurance, protection plans, or late enrollment. If a purchase_date is provided, it determines enrollment eligibility (within 60 days = immediate, 60-365 days = late enrollment with Vision check required, >365 days = expired).",
      inputSchema: {
        plan_type: z
          .enum(["basic", "premium", "all"])
          .optional()
          .describe("Specific Care+ plan to show, or 'all' for comparison"),
        device_model: z
          .string()
          .optional()
          .describe("Device model to check eligibility for"),
        purchase_date: z
          .string()
          .optional()
          .describe("ISO date of device purchase (e.g., '2025-10-01') — used to determine enrollment window"),
        include_faq: z
          .boolean()
          .optional()
          .describe("Whether to include FAQ section"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/care-plus.html" },
        "openai/outputTemplate": "ui://widget/care-plus.html",
      },
    },
    async (args) => {
      const { plan_type, device_model, purchase_date, include_faq } = args;

      let plans = [...carePlusData.plans];
      if (plan_type && plan_type !== "all") {
        plans = plans.filter((p: any) => p.id === `care-${plan_type}`);
      }

      // Determine enrollment status
      let enrollmentStatus: any = null;
      if (purchase_date) {
        const purchaseMs = new Date(purchase_date).getTime();
        const nowMs = Date.now();
        const daysSincePurchase = Math.floor((nowMs - purchaseMs) / (1000 * 60 * 60 * 24));

        if (daysSincePurchase <= carePlusData.enrollment_rules.standard_window_days) {
          enrollmentStatus = {
            status: "eligible_immediate",
            days_since_purchase: daysSincePurchase,
            message: "구매 후 60일 이내 — 즉시 가입 가능합니다.",
          };
        } else if (daysSincePurchase <= carePlusData.enrollment_rules.late_enrollment.max_days_after_purchase) {
          enrollmentStatus = {
            status: "eligible_late_enrollment",
            days_since_purchase: daysSincePurchase,
            message: `구매 후 ${daysSincePurchase}일 경과 — 기기 상태 확인(Vision 검사) 후 Late Enrollment 가입 가능합니다.`,
            requires_vision_check: true,
          };
        } else {
          enrollmentStatus = {
            status: "expired",
            days_since_purchase: daysSincePurchase,
            message: "구매 후 1년 초과 — 가입 기간이 만료되었습니다.",
          };
        }
      }

      // Recommend plan and find device-specific pricing
      let recommendedPlan: string | null = null;
      let devicePricing: any = null;
      if (device_model) {
        const dl = device_model.toLowerCase();
        const isFoldable = dl.includes("fold") || dl.includes("flip");
        if (dl.includes("ultra") || isFoldable) {
          recommendedPlan = "care-premium";
        }
        // Foldables require Premium
        if (isFoldable) {
          recommendedPlan = "care-premium";
        }
        // Look up device-specific pricing
        const pricingData = (carePlusData as any).pricing_by_device_category;
        if (pricingData) {
          for (const [, catData] of Object.entries(pricingData) as any) {
            if (catData.devices?.some((d: string) => dl.includes(d.toLowerCase()) || d.toLowerCase().includes(dl))) {
              devicePricing = catData;
              break;
            }
          }
        }
      }

      const faqs = include_faq !== false ? carePlusData.faq : [];

      const plansSummary = plans
        .map((p: any) => `**${p.name}**: $${p.monthly_price}/월 — ${p.coverage.join(", ")}`)
        .join("\n");

      let statusText = "";
      if (enrollmentStatus) {
        statusText = `\n\n**가입 상태:** ${enrollmentStatus.message}`;
        if (enrollmentStatus.status === "eligible_late_enrollment") {
          const fee = (carePlusData.enrollment_rules.late_enrollment as any).late_enrollment_fee;
          if (fee) {
            statusText += `\n(Late Enrollment 수수료: $${fee})`;
          }
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `# Samsung Care+\n\n${carePlusData.description}\n\n## Plans\n${plansSummary}${statusText}`,
          },
        ],
        structuredContent: {
          service_name: carePlusData.service_name,
          description: carePlusData.description,
          plans: plans.map((p: any) => ({
            ...p,
            is_recommended: p.id === recommendedPlan,
          })),
          enrollment_status: enrollmentStatus,
          enrollment_rules: carePlusData.enrollment_rules,
          device_pricing: devicePricing,
          claim_process: (carePlusData as any).claim_process ?? null,
          service_centers: (carePlusData as any).service_centers ?? null,
          exclusions: (carePlusData as any).exclusions ?? null,
          faq: faqs,
          device_model: device_model ?? null,
        },
      };
    }
  );

  // Tool 8: Check Care+ Eligibility — Vision-based late enrollment (UC1)
  registerAppTool(
    server,
    "check_care_plus_eligibility",
    {
      title: "Check Care+ Late Enrollment Eligibility",
      description:
        `Checks Samsung Care+ late enrollment eligibility by Vision-based device condition analysis.

WHEN TO USE: 사용자가 구매 후 60일~1년 이내 기기로 Care+ 가입을 원할 때, 기기 사진을 업로드하면 이 도구를 호출합니다.

STEP-BY-STEP:
1. 사용자에게 "기기의 앞면과 뒷면 사진을 대화창에 업로드해 주세요"라고 안내
2. 사진이 업로드되면 Vision으로 분석하여 아래 항목 판단:

**화면 상태 (screen_condition):**
- no_scratches: 스크래치 없음 → ✅ 통과
- light_scratches: 미세 스크래치 → ✅ 통과
- visible_scratches: 눈에 보이는 스크래치 → ❌ 불통과
- cracked: 화면 깨짐 → ❌ 불통과

**외관 상태 (body_condition):**
- pristine: 새것 같은 상태 → ✅ 통과
- minor_wear: 미세한 사용 흔적 → ✅ 통과
- dents_scratches: 찍힘/스크래치 → ❌ 불통과
- major_damage: 심한 파손 → ❌ 불통과

**카메라 상태 (camera_condition):**
- clear: 깨끗 → ✅ 통과
- minor_smudge: 약간 얼룩 → ✅ 통과
- scratched: 스크래치 → ❌ 불통과
- cracked: 깨짐 → ❌ 불통과

3. 모든 항목이 통과해야 Late Enrollment이 승인됩니다.`,
      inputSchema: {
        device_model: z.string().describe("기기 모델명 (예: 'Galaxy S24 Ultra')"),
        purchase_date: z.string().describe("구매일 ISO 날짜 (예: '2025-10-01')"),
        vision_analysis: z.object({
          screen_condition: z.enum(["no_scratches", "light_scratches", "visible_scratches", "cracked"]).describe("화면 상태: no_scratches(깨끗), light_scratches(미세), visible_scratches(눈에 보임), cracked(깨짐)"),
          body_condition: z.enum(["pristine", "minor_wear", "dents_scratches", "major_damage"]).describe("외관 상태: pristine(새것), minor_wear(미세 흔적), dents_scratches(찍힘), major_damage(심한 파손)"),
          camera_condition: z.enum(["clear", "minor_smudge", "scratched", "cracked"]).optional().describe("카메라 상태: clear(깨끗), minor_smudge(얼룩), scratched(스크래치), cracked(깨짐)"),
        }),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/care-plus.html" },
        "openai/outputTemplate": "ui://widget/care-plus.html",
      },
    },
    async (args) => {
      const { device_model, purchase_date, vision_analysis } = args;

      const purchaseMs = new Date(purchase_date).getTime();
      const nowMs = Date.now();
      const daysSincePurchase = Math.floor((nowMs - purchaseMs) / (1000 * 60 * 60 * 24));

      // Check time window
      if (daysSincePurchase <= 60) {
        return {
          content: [{ type: "text" as const, text: `${device_model}은(는) 구매 후 60일 이내이므로 Vision 검사 없이 즉시 Care+ 가입 가능합니다.` }],
          structuredContent: {
            service_name: carePlusData.service_name,
            description: carePlusData.description,
            plans: carePlusData.plans,
            eligibility_result: { eligible: true, reason: "standard_enrollment", days_since_purchase: daysSincePurchase },
            device_model,
          },
        };
      }

      if (daysSincePurchase > 365) {
        return {
          content: [{ type: "text" as const, text: `${device_model}은(는) 구매 후 1년이 초과되어 Care+ 가입이 불가합니다.` }],
          structuredContent: {
            service_name: carePlusData.service_name,
            description: carePlusData.description,
            plans: [],
            eligibility_result: { eligible: false, reason: "expired", days_since_purchase: daysSincePurchase },
            device_model,
          },
        };
      }

      // Late enrollment — check conditions
      const requirements = carePlusData.enrollment_rules.late_enrollment.condition_requirements;
      const screenPass = requirements.screen_condition.includes(vision_analysis.screen_condition);
      const bodyPass = requirements.body_condition.includes(vision_analysis.body_condition);
      const cameraPass = vision_analysis.camera_condition
        ? requirements.camera_condition.includes(vision_analysis.camera_condition)
        : true;

      const eligible = screenPass && bodyPass && cameraPass;

      const failedChecks: string[] = [];
      if (!screenPass) failedChecks.push(`화면: ${vision_analysis.screen_condition}`);
      if (!bodyPass) failedChecks.push(`외관: ${vision_analysis.body_condition}`);
      if (!cameraPass) failedChecks.push(`카메라: ${vision_analysis.camera_condition}`);

      // Recommend plan
      const dl = device_model.toLowerCase();
      const recommendedPlan = (dl.includes("ultra") || dl.includes("fold") || dl.includes("flip"))
        ? "care-premium"
        : "care-basic";

      const lateEnrollmentFee = (carePlusData.enrollment_rules.late_enrollment as any).late_enrollment_fee ?? 0;
      const resultText = eligible
        ? `✅ ${device_model} Late Enrollment 승인! 기기 상태가 기준을 충족합니다. Care+ 가입이 가능합니다.${lateEnrollmentFee ? ` (Late Enrollment 수수료: $${lateEnrollmentFee})` : ""}`
        : `❌ ${device_model} Late Enrollment 불가. 다음 항목이 기준 미달입니다: ${failedChecks.join(", ")}`;

      return {
        content: [{ type: "text" as const, text: resultText }],
        structuredContent: {
          service_name: carePlusData.service_name,
          description: carePlusData.description,
          plans: eligible
            ? carePlusData.plans.map((p: any) => ({ ...p, is_recommended: p.id === recommendedPlan }))
            : [],
          eligibility_result: {
            eligible,
            reason: eligible ? "late_enrollment_approved" : "condition_not_met",
            days_since_purchase: daysSincePurchase,
            vision_assessment: vision_analysis,
            checks: {
              screen: { value: vision_analysis.screen_condition, pass: screenPass },
              body: { value: vision_analysis.body_condition, pass: bodyPass },
              camera: { value: vision_analysis.camera_condition ?? "N/A", pass: cameraPass },
            },
            failed_checks: failedChecks,
          },
          device_model,
          late_enrollment_fee: eligible ? lateEnrollmentFee : null,
          vision_check_process: (carePlusData.enrollment_rules.late_enrollment as any).vision_check_process ?? null,
          faq: carePlusData.faq,
        },
      };
    }
  );

  // Tool 9: Compare Galaxy Club Cost (UC2)
  registerAppTool(
    server,
    "compare_galaxy_club_cost",
    {
      title: "Compare Galaxy Club Cost",
      description:
        "Compares Galaxy Club subscription cost vs outright purchase for a specific device. Shows monthly/annual cost breakdown, included benefits value, and savings. Use when customers want to compare whether Galaxy Club or buying outright is a better deal.",
      inputSchema: {
        device_model: z.string().describe("Device to compare (e.g., 'Galaxy S25 Ultra')"),
        plan_type: z.enum(["basic", "premium", "family"]).describe("Galaxy Club plan type"),
        current_device_tradein: z.string().optional().describe("Current device for trade-in value calculation (e.g., 'Galaxy S23 Ultra')"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/comparison.html", visibility: ["model", "app"] },
        "openai/outputTemplate": "ui://widget/comparison.html",
      },
    },
    async (args) => {
      const { device_model, plan_type, current_device_tradein } = args;

      // Find cost_comparison entry
      const modelLower = device_model.toLowerCase();
      const costData = (plansData as any).cost_comparison?.find(
        (c: any) => c.device.toLowerCase().includes(modelLower) || modelLower.includes(c.device.toLowerCase().split(" ").slice(0, 3).join(" "))
      );

      // Find plan
      const plan = plansData.plans.find((p: any) => p.id === `ngc-${plan_type}`);

      if (!plan) {
        return {
          content: [{ type: "text" as const, text: `Plan "${plan_type}" not found.` }],
          structuredContent: { error: "plan_not_found" },
        };
      }

      // Use cost_comparison data if available, otherwise look up device msrp
      let retailPrice = costData?.retail_price ?? 1299;
      if (!costData) {
        const deviceData = devicesData.devices.find((d: any) => d.model.toLowerCase().includes(modelLower));
        if (deviceData?.msrp) {
          const msrpVals = deviceData.msrp as unknown as Record<string, number>;
          retailPrice = Object.values(msrpVals)[0] ?? retailPrice;
        }
      }
      const monthlyCost = plan.monthly_price;
      const totalPeriod = plan.upgrade_cycle_months ?? 12;
      const totalCost = monthlyCost * totalPeriod;
      const carePlusValueIncluded = costData?.care_plus_value_included ?? (plan_type === "premium" ? 215 : 144);

      // Trade-in calculation
      let tradeinValue = 0;
      let tradeinInfo: any = null;
      if (current_device_tradein) {
        // First check if there's a pre-computed comparison with trade-in
        const tradeinComp = (plansData as any).cost_comparison?.find(
          (c: any) => c.trade_in_device && c.trade_in_device.toLowerCase().includes(current_device_tradein.toLowerCase())
        );
        if (tradeinComp) {
          tradeinValue = tradeinComp.trade_in_value;
          tradeinInfo = {
            device: tradeinComp.trade_in_device,
            estimated_value: tradeinValue,
            note: tradeinComp.note || "Galaxy Club은 기기 반납형이라 별도 Trade-in이 불필요하지만, 일반 구매 시 적용 가능합니다.",
          };
        } else {
          const tradeinLower = current_device_tradein.toLowerCase();
          const tradeinDevice = devicesData.devices.find(
            (d: any) => d.model.toLowerCase().includes(tradeinLower) || tradeinLower.includes(d.model.toLowerCase())
          );
          if (tradeinDevice) {
            const baseVals = tradeinDevice.base_values as unknown as Record<string, number>;
            tradeinValue = Math.round((Object.values(baseVals)[0] ?? 0) * 0.85);
            tradeinInfo = {
              device: tradeinDevice.model,
              estimated_value: tradeinValue,
              note: "Galaxy Club은 기기 반납형이라 별도 Trade-in이 불필요하지만, 일반 구매 시 적용 가능합니다.",
            };
          }
        }
      }

      const outrightTotal = retailPrice + carePlusValueIncluded - tradeinValue;
      const savings = costData?.total_value_saved ?? (outrightTotal - totalCost);

      // Benefits included in club
      const includedBenefits = plan.benefits.slice(0, 5);

      // Lifecycle
      const lifecycleStages = (plansData as any).lifecycle?.stages || [];

      const recommendation = savings > 0
        ? `Galaxy Club ${plan.name}이 일반 구매 대비 $${savings} 절약됩니다. ${totalPeriod}개월마다 최신 기기로 업그레이드도 가능합니다.`
        : `일반 구매가 $${Math.abs(savings)} 더 경제적입니다. 단, Galaxy Club은 업그레이드와 Care+ 포함 혜택이 있습니다.`;

      const noteText = costData?.note ? `\n\n💡 ${costData.note}` : "";

      return {
        content: [
          {
            type: "text" as const,
            text: `## ${device_model} 비용 비교\n\n**Galaxy Club ${plan.name}:** $${monthlyCost}/월 × ${totalPeriod}개월 = $${totalCost}\n**일반 구매:** $${retailPrice}${tradeinValue ? ` - Trade-in $${tradeinValue} = $${retailPrice - tradeinValue}` : ""}\n\n**절약액: $${savings}**\n\n${recommendation}${noteText}`,
          },
        ],
        structuredContent: {
          device_model,
          comparison: {
            club: {
              plan_name: plan.name,
              plan_id: plan.id,
              monthly_cost: monthlyCost,
              total_months: totalPeriod,
              total_cost: totalCost,
              care_plus_included: true,
              care_plus_value: carePlusValueIncluded,
              upgrade_included: true,
              net_cost: totalCost,
              included_benefits: includedBenefits,
            },
            outright: {
              device_price: retailPrice,
              care_plus_cost: carePlusValueIncluded,
              tradein_credit: tradeinValue || null,
              total_cost: outrightTotal,
            },
          },
          savings: savings > 0 ? savings : 0,
          recommendation,
          lifecycle_stages: lifecycleStages,
          included_benefits_value: carePlusValueIncluded,
          tradein_info: tradeinInfo,
        },
      };
    }
  );

  // Tool 10: Analyze Trade-in Device — Vision-based re-appraisal (UC3)
  registerAppTool(
    server,
    "analyze_tradein_device",
    {
      title: "Analyze Trade-in Device (Vision)",
      description:
        `Re-appraises a trade-in device using Vision analysis of uploaded photos. Call this AFTER the user uploads device photos in the chat.

STEP-BY-STEP:
1. 사용자가 대화창에 기기 사진(앞면/뒷면)을 업로드하면
2. 당신의 Vision 기능으로 사진을 분석하여 아래 항목을 판단하세요:

**화면 상태 (screen_condition):**
- no_scratches: 스크래치 없이 깨끗한 화면
- light_scratches: 빛에 비춰야 보이는 미세 스크래치
- visible_scratches: 육안으로 보이는 스크래치
- cracked: 화면 깨짐/금

**외관 상태 (body_condition):**
- pristine: 새것 같은 깨끗한 외관
- minor_wear: 미세한 사용 흔적 (경미한 스크래치)
- dents_scratches: 눈에 띄는 스크래치, 찍힘
- major_damage: 심한 파손, 큰 찍힘/함몰

**카메라 렌즈 상태 (camera_condition):**
- clear: 깨끗한 렌즈
- minor_smudge: 약간의 얼룩/먼지
- scratched: 렌즈 스크래치
- cracked: 렌즈 깨짐

3. 분석 결과를 이 도구에 전달하면 기존 견적 대비 재산정된 금액(Before/After)을 제공합니다.`,
      inputSchema: {
        appraisal_id: z.string().describe("start_tradein_appraisal에서 발급받은 견적 ID"),
        vision_analysis: z.object({
          identified_model: z.string().optional().describe("사진에서 식별한 기기 모델명"),
          screen_condition: z.enum(["no_scratches", "light_scratches", "visible_scratches", "cracked"]).describe("화면 상태: no_scratches(깨끗), light_scratches(미세), visible_scratches(눈에 보임), cracked(깨짐)"),
          body_condition: z.enum(["pristine", "minor_wear", "dents_scratches", "major_damage"]).describe("외관 상태: pristine(새것), minor_wear(미세 흔적), dents_scratches(찍힘), major_damage(심한 파손)"),
          camera_condition: z.enum(["clear", "minor_smudge", "scratched", "cracked"]).optional().describe("카메라 상태: clear(깨끗), minor_smudge(얼룩), scratched(스크래치), cracked(깨짐)"),
          additional_observations: z.array(z.string()).optional().describe("기타 관찰 사항 (예: '배터리 팽창 흔적', '방수 씰 손상')"),
        }),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/tradein.html" },
        "openai/outputTemplate": "ui://widget/tradein.html",
      },
    },
    async (args) => {
      const { appraisal_id, vision_analysis } = args;

      const appraisal = appraisalStore.get(appraisal_id);
      if (!appraisal) {
        return {
          content: [{ type: "text" as const, text: `견적을 찾을 수 없습니다: ${appraisal_id}.` }],
          structuredContent: { error: "appraisal_not_found", appraisal_id },
        };
      }

      const criteria = (devicesData as any).vision_assessment_criteria;
      const originalValue = appraisal.valuation.final_value;

      // Map vision conditions to grades
      const screenGrade = criteria.screen_condition[vision_analysis.screen_condition] || "fair";
      const bodyGrade = criteria.body_condition[vision_analysis.body_condition] || "fair";
      const cameraGrade = vision_analysis.camera_condition
        ? criteria.camera_condition[vision_analysis.camera_condition] || "fair"
        : "good";

      // Determine overall grade
      const gradeOrder = ["excellent", "good", "fair", "poor"];
      const grades = [screenGrade, bodyGrade, cameraGrade];
      const worstIndex = Math.max(...grades.map(g => gradeOrder.indexOf(g)));
      const avgIndex = Math.round(grades.reduce((sum, g) => sum + gradeOrder.indexOf(g), 0) / grades.length);
      const overallGrade = gradeOrder[avgIndex];

      // Recalculate with new condition
      const conditionMultiplier = (devicesData.condition_multipliers as any)[overallGrade] || 0.65;
      const baseValue = appraisal.valuation.base_value;
      const conditionAdjustment = Math.round(baseValue * (conditionMultiplier - 1));
      const promotionalBonus = appraisal.valuation.promotional_bonus || 0;
      const newFinalValue = Math.max(0, baseValue + conditionAdjustment + promotionalBonus);

      // Update appraisal
      appraisal.vision_condition = overallGrade;
      appraisal.vision_analysis = vision_analysis;
      appraisal.valuation.condition_adjustment = conditionAdjustment;
      appraisal.valuation.final_value = newFinalValue;
      appraisal.condition = overallGrade;
      appraisal.status = "completed";
      appraisalStore.set(appraisal_id, appraisal);

      const diff = newFinalValue - originalValue;
      const diffText = diff >= 0
        ? `보상판매 가격이 $${originalValue}에서 **$${newFinalValue}**로 $${diff} 상향 조정되었습니다.`
        : `보상판매 가격이 $${originalValue}에서 **$${newFinalValue}**로 $${Math.abs(diff)} 하향 조정되었습니다.`;

      return {
        content: [
          {
            type: "text" as const,
            text: `## Vision 기반 재산정 결과\n\n**기기:** ${appraisal.device.model}\n**화면:** ${vision_analysis.screen_condition} (${screenGrade})\n**외관:** ${vision_analysis.body_condition} (${bodyGrade})\n**카메라:** ${vision_analysis.camera_condition ?? "N/A"} (${cameraGrade})\n**종합 상태:** ${overallGrade}\n\n${diffText}`,
          },
        ],
        structuredContent: {
          appraisal_id: appraisal.appraisal_id,
          device: appraisal.device,
          condition: overallGrade,
          condition_description: (devicesData.condition_descriptions as any)[overallGrade],
          valuation: {
            ...appraisal.valuation,
            breakdown: {
              base: `$${baseValue}`,
              condition: `${conditionAdjustment >= 0 ? "+" : ""}$${conditionAdjustment}`,
              issues: `$0`,
              bonus: promotionalBonus > 0 ? `+$${promotionalBonus}` : null,
              total: `$${newFinalValue}`,
            },
          },
          valid_until: appraisal.valid_until,
          status: "completed",
          vision_conditions: {
            screen_condition: vision_analysis.screen_condition,
            body_condition: vision_analysis.body_condition,
            camera_condition: vision_analysis.camera_condition ?? null,
          },
          vision_analysis_result: {
            original_value: originalValue,
            new_value: newFinalValue,
            difference: diff,
            overall_grade: overallGrade,
            screen_grade: screenGrade,
            body_grade: bodyGrade,
            camera_grade: cameraGrade,
          },
          next_steps: [
            "Accept the trade-in offer",
            "Ship your device using the free prepaid label",
            "Receive your credit within 3-5 business days",
          ],
          cta: {
            text: "Accept Trade-in Offer",
            action: "accept_tradein",
          },
        },
      };
    }
  );

  return server;
}

// HTTP Server Setup
const port = Number(process.env.PORT ?? 8787);
const MCP_PATH = "/mcp";

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  // CORS preflight
  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("Samsung Galaxy Services MCP Server - OK");
    return;
  }

  // MCP endpoint
  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    const server = createSamsungServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(port, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║       Samsung Galaxy Services MCP Server                     ║
╠══════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${port}${MCP_PATH.padEnd(20)}║
║                                                              ║
║  Using @modelcontextprotocol/ext-apps for ChatGPT widgets    ║
║                                                              ║
║  Available Tools:                                            ║
║  • get_service_guidelines    - Service guidelines (first!)   ║
║  • get_galaxy_club_info      - Galaxy Club subscription      ║
║  • compare_galaxy_club_cost  - Club vs purchase comparison   ║
║  • get_care_plus_info        - Samsung Care+ insurance       ║
║  • check_care_plus_eligibility - Care+ late enrollment       ║
║  • start_tradein_appraisal   - Start trade-in appraisal      ║
║  • submit_tradein_images     - Submit device images          ║
║  • analyze_tradein_device    - Vision-based re-appraisal     ║
║  • get_tradein_result        - Get appraisal result          ║
║  • search_tradein_value       - Search trade-in value         ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
