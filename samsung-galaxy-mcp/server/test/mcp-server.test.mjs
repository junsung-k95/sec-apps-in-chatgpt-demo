/**
 * MCP Server Integration Test
 *
 * ChatGPT 연동 없이 MCP 서버의 도구/리소스가 정상 동작하는지 검증.
 * 서버가 localhost:8787에서 실행 중이어야 합니다.
 *
 * 실행: node test/mcp-server.test.mjs
 */

const BASE_URL = process.env.MCP_URL || "http://localhost:8787";
const MCP_PATH = "/mcp";

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

// ===== Helpers =====

async function mcpRequest(method, params = {}) {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  });

  const res = await fetch(`${BASE_URL}${MCP_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const contentType = res.headers.get("content-type") || "";

  // SSE response
  if (contentType.includes("text/event-stream")) {
    const text = await res.text();
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.id && (parsed.result || parsed.error)) {
            return parsed;
          }
        } catch {}
      }
    }
    throw new Error("No valid JSON-RPC response in SSE stream");
  }

  // JSON response
  if (contentType.includes("application/json")) {
    return await res.json();
  }

  throw new Error(`Unexpected content type: ${contentType}`);
}

async function initializeSession() {
  return mcpRequest("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" },
  });
}

async function callTool(name, args = {}) {
  return mcpRequest("tools/call", { name, arguments: args });
}

async function listTools() {
  return mcpRequest("tools/list", {});
}

async function listResources() {
  return mcpRequest("resources/list", {});
}

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function test(name, fn) {
  try {
    await fn();
    testsPassed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    testsFailed++;
    failures.push({ name, error: e.message });
    console.log(`  ❌ ${name}`);
    console.log(`     → ${e.message}`);
  }
}

// ===== Tests =====

async function runTests() {
  console.log("\n🔧 MCP Server Integration Tests\n");
  console.log(`Target: ${BASE_URL}${MCP_PATH}\n`);

  // --- Health Check ---
  console.log("📌 Health Check");
  await test("GET / returns 200 OK", async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert(res.ok, `Expected 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes("OK"), `Expected 'OK' in response, got: ${text}`);
  });

  // --- MCP Initialize ---
  console.log("\n📌 MCP Initialize");
  await test("Initialize returns server info", async () => {
    const res = await initializeSession();
    assert(res.result, "No result in response");
    assert(res.result.serverInfo, "No serverInfo");
    assert(res.result.serverInfo.name === "samsung-galaxy-services", `Unexpected server name: ${res.result.serverInfo.name}`);
  });

  // --- Tools List ---
  console.log("\n📌 Tools List");
  await test("Lists all registered tools", async () => {
    await initializeSession();
    const res = await listTools();
    assert(res.result, "No result");
    const tools = res.result.tools;
    assert(Array.isArray(tools), "tools is not an array");

    const toolNames = tools.map(t => t.name);
    const expected = [
      "get_service_guidelines",
      "get_galaxy_club_info",
      "get_care_plus_info",
      "check_care_plus_eligibility",
      "compare_galaxy_club_cost",
      "start_tradein_appraisal",
      "get_tradein_result",
      "search_tradein_value",
      "analyze_tradein_device",
    ];

    for (const name of expected) {
      assert(toolNames.includes(name), `Missing tool: ${name}. Found: ${toolNames.join(", ")}`);
    }
  });

  // --- Resources List ---
  console.log("\n📌 Resources List");
  await test("Lists all widget resources", async () => {
    await initializeSession();
    const res = await listResources();
    assert(res.result, "No result");
    const resources = res.result.resources;
    assert(Array.isArray(resources), "resources is not an array");

    const uris = resources.map(r => r.uri);
    const expected = [
      "ui://widget/galaxy-club.html",
      "ui://widget/tradein.html",
      "ui://widget/care-plus.html",
      "ui://widget/comparison.html",
    ];

    for (const uri of expected) {
      assert(uris.includes(uri), `Missing resource: ${uri}. Found: ${uris.join(", ")}`);
    }
  });

  // --- Tool: get_service_guidelines ---
  console.log("\n📌 Tool: get_service_guidelines");
  await test("Returns guidelines with role and services", async () => {
    await initializeSession();
    const res = await callTool("get_service_guidelines", {});
    assert(res.result, "No result");
    const sc = res.result.structuredContent;
    assert(sc, "No structuredContent");
    assert(sc.guidelines, "No guidelines in structuredContent");
    assert(sc.guidelines.role, "No role in guidelines");
    assert(sc.guidelines.services, "No services in guidelines");
    assert(sc.guidelines.services.care_plus, "No care_plus service");
    assert(sc.guidelines.services.galaxy_club, "No galaxy_club service");
    assert(sc.guidelines.services.trade_in, "No trade_in service");
  });

  // --- Tool: get_galaxy_club_info ---
  console.log("\n📌 Tool: get_galaxy_club_info");
  await test("Returns plans with all plan type", async () => {
    await initializeSession();
    const res = await callTool("get_galaxy_club_info", { plan_type: "all" });
    assert(res.result, "No result");
    const sc = res.result.structuredContent;
    assert(sc.plans, "No plans");
    assert(sc.plans.length >= 3, `Expected >= 3 plans, got ${sc.plans.length}`);
    assert(sc.service_name, "No service_name");
    assert(sc.enrollment_steps, "No enrollment_steps");
    assert(sc.lifecycle_stages, "No lifecycle_stages");
  });

  await test("Returns single plan when filtered", async () => {
    await initializeSession();
    const res = await callTool("get_galaxy_club_info", { plan_type: "premium" });
    const sc = res.result.structuredContent;
    assert(sc.plans.length === 1, `Expected 1 plan, got ${sc.plans.length}`);
    assert(sc.plans[0].id === "ngc-premium", `Expected ngc-premium, got ${sc.plans[0].id}`);
  });

  await test("Recommends premium for Ultra device", async () => {
    await initializeSession();
    const res = await callTool("get_galaxy_club_info", { device_interest: "Galaxy S25 Ultra" });
    const sc = res.result.structuredContent;
    assert(sc.recommended_plan_id === "ngc-premium", `Expected ngc-premium recommendation`);
  });

  // --- Tool: get_care_plus_info ---
  console.log("\n📌 Tool: get_care_plus_info");
  await test("Returns Care+ plans and enrollment rules", async () => {
    await initializeSession();
    const res = await callTool("get_care_plus_info", { plan_type: "all" });
    const sc = res.result.structuredContent;
    assert(sc.plans, "No plans");
    assert(sc.plans.length >= 2, `Expected >= 2 plans, got ${sc.plans.length}`);
    assert(sc.enrollment_rules, "No enrollment_rules");
  });

  await test("Detects immediate enrollment (within 60 days)", async () => {
    await initializeSession();
    const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const res = await callTool("get_care_plus_info", { purchase_date: recentDate });
    const sc = res.result.structuredContent;
    assert(sc.enrollment_status, "No enrollment_status");
    assert(sc.enrollment_status.status === "eligible_immediate", `Expected eligible_immediate, got ${sc.enrollment_status.status}`);
  });

  await test("Detects late enrollment (60-365 days)", async () => {
    await initializeSession();
    const lateDate = new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const res = await callTool("get_care_plus_info", { purchase_date: lateDate });
    const sc = res.result.structuredContent;
    assert(sc.enrollment_status.status === "eligible_late_enrollment", `Expected eligible_late_enrollment, got ${sc.enrollment_status.status}`);
  });

  await test("Detects expired enrollment (>365 days)", async () => {
    await initializeSession();
    const oldDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const res = await callTool("get_care_plus_info", { purchase_date: oldDate });
    const sc = res.result.structuredContent;
    assert(sc.enrollment_status.status === "expired", `Expected expired, got ${sc.enrollment_status.status}`);
  });

  // --- Tool: check_care_plus_eligibility ---
  console.log("\n📌 Tool: check_care_plus_eligibility");
  await test("Approves good condition device for late enrollment", async () => {
    await initializeSession();
    const purchaseDate = new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const res = await callTool("check_care_plus_eligibility", {
      device_model: "Galaxy S24 Ultra",
      purchase_date: purchaseDate,
      vision_analysis: {
        screen_condition: "no_scratches",
        body_condition: "minor_wear",
        camera_condition: "clear",
      },
    });
    const sc = res.result.structuredContent;
    assert(sc.eligibility_result, "No eligibility_result");
    assert(sc.eligibility_result.eligible === true, "Expected eligible=true");
  });

  await test("Rejects poor condition device", async () => {
    await initializeSession();
    const purchaseDate = new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const res = await callTool("check_care_plus_eligibility", {
      device_model: "Galaxy S24 Ultra",
      purchase_date: purchaseDate,
      vision_analysis: {
        screen_condition: "cracked",
        body_condition: "major_damage",
      },
    });
    const sc = res.result.structuredContent;
    assert(sc.eligibility_result.eligible === false, "Expected eligible=false");
    assert(sc.eligibility_result.failed_checks.length > 0, "Expected failed_checks");
  });

  // --- Tool: search_tradein_value ---
  console.log("\n📌 Tool: search_tradein_value");
  await test("Finds device by model name", async () => {
    await initializeSession();
    const res = await callTool("search_tradein_value", {
      query: "S24 Ultra",
      region: "US",
      carrier: "unlocked",
    });
    const sc = res.result.structuredContent;
    assert(sc.results, "No results");
    assert(sc.results.length > 0, "Empty results");
    assert(sc.results[0].model.includes("S24") || sc.results[0].model.includes("S25"), `Unexpected model: ${sc.results[0].model}`);
  });

  await test("Applies region multiplier for KR", async () => {
    await initializeSession();
    const usRes = await callTool("search_tradein_value", { query: "S24 Ultra", region: "US", carrier: "unlocked" });
    await initializeSession();
    const krRes = await callTool("search_tradein_value", { query: "S24 Ultra", region: "KR", carrier: "unlocked" });
    const usVal = usRes.result.structuredContent.results[0].valuations[0];
    const krVal = krRes.result.structuredContent.results[0].valuations[0];
    assert(krVal.region_adjusted < usVal.region_adjusted, "KR price should be lower than US");
  });

  await test("Returns no_results for unknown device", async () => {
    await initializeSession();
    const res = await callTool("search_tradein_value", {
      query: "iPhone 15",
      region: "US",
      carrier: "unlocked",
    });
    const sc = res.result.structuredContent;
    assert(sc.error === "no_results", `Expected no_results error, got: ${sc.error}`);
  });

  // --- Tool: start_tradein_appraisal ---
  console.log("\n📌 Tool: start_tradein_appraisal");
  let testAppraisalId = null;

  await test("Creates appraisal with valid device", async () => {
    await initializeSession();
    const res = await callTool("start_tradein_appraisal", {
      device_model: "Galaxy S24 Ultra",
      storage_capacity: "256GB",
      device_condition: "good",
      region: "US",
      carrier: "unlocked",
    });
    const sc = res.result.structuredContent;
    assert(sc.appraisal_id, "No appraisal_id");
    assert(sc.valuation, "No valuation");
    assert(sc.valuation.final_value > 0, "final_value should be > 0");
    assert(sc.status === "initial_estimate" || sc.status === "pending_images", `Expected initial_estimate or pending_images, got ${sc.status}`);
    testAppraisalId = sc.appraisal_id;
  });

  await test("Returns error for unknown device", async () => {
    await initializeSession();
    const res = await callTool("start_tradein_appraisal", {
      device_model: "Nokia 3310",
      device_condition: "excellent",
    });
    const sc = res.result.structuredContent;
    assert(sc.error === "device_not_found", `Expected device_not_found, got ${sc.error}`);
  });

  await test("Applies region/carrier adjustments", async () => {
    await initializeSession();
    const usRes = await callTool("start_tradein_appraisal", {
      device_model: "Galaxy S24 Ultra",
      storage_capacity: "256GB",
      device_condition: "good",
      region: "US",
      carrier: "unlocked",
    });
    await initializeSession();
    const krRes = await callTool("start_tradein_appraisal", {
      device_model: "Galaxy S24 Ultra",
      storage_capacity: "256GB",
      device_condition: "good",
      region: "KR",
      carrier: "skt",
    });
    const usVal = usRes.result.structuredContent.valuation.final_value;
    const krVal = krRes.result.structuredContent.valuation.final_value;
    assert(krVal < usVal, `KR+SKT value (${krVal}) should be less than US+unlocked (${usVal})`);
  });

  // --- Tool: get_tradein_result ---
  console.log("\n📌 Tool: get_tradein_result");
  await test("Returns appraisal result by ID", async () => {
    if (!testAppraisalId) { throw new Error("No appraisal ID from previous test"); }
    await initializeSession();
    const res = await callTool("get_tradein_result", { appraisal_id: testAppraisalId });
    const sc = res.result.structuredContent;
    assert(sc.appraisal_id === testAppraisalId, "Appraisal ID mismatch");
    assert(sc.next_steps, "No next_steps");
    assert(sc.cta, "No cta");
  });

  await test("Returns error for non-existent appraisal", async () => {
    await initializeSession();
    const res = await callTool("get_tradein_result", { appraisal_id: "fake-id-123" });
    const sc = res.result.structuredContent;
    assert(sc.error === "appraisal_not_found", `Expected appraisal_not_found, got ${sc.error}`);
  });

  // --- Tool: analyze_tradein_device ---
  console.log("\n📌 Tool: analyze_tradein_device");
  await test("Re-appraises with vision analysis", async () => {
    if (!testAppraisalId) { throw new Error("No appraisal ID from previous test"); }
    await initializeSession();
    const res = await callTool("analyze_tradein_device", {
      appraisal_id: testAppraisalId,
      vision_analysis: {
        screen_condition: "no_scratches",
        body_condition: "pristine",
        camera_condition: "clear",
      },
    });
    const sc = res.result.structuredContent;
    assert(sc.vision_analysis_result, "No vision_analysis_result");
    assert(sc.vision_analysis_result.original_value > 0, "original_value should be > 0");
    assert(sc.vision_analysis_result.new_value > 0, "new_value should be > 0");
    assert(sc.vision_conditions, "No vision_conditions");
    assert(sc.status === "completed", `Expected completed, got ${sc.status}`);
  });

  // --- Trade-in Vision Bug Fix Regression Tests ---
  console.log("\n📌 Trade-in Vision 가격 재산정 버그 수정 검증");

  await test("Cracked screen Vision re-appraisal must be LOWER than good initial estimate", async () => {
    // Create a fresh appraisal with "good" condition
    await initializeSession();
    const appraisalRes = await callTool("start_tradein_appraisal", {
      device_model: "Galaxy S25",
      storage_capacity: "256GB",
      device_condition: "good",
      region: "KR",
      carrier: "unlocked",
    });
    const initialValue = appraisalRes.result.structuredContent.valuation.final_value;
    const apprId = appraisalRes.result.structuredContent.appraisal_id;
    assert(initialValue > 0, "Initial value should be > 0");

    // Re-appraise with cracked screen
    await initializeSession();
    const visionRes = await callTool("analyze_tradein_device", {
      appraisal_id: apprId,
      vision_analysis: {
        screen_condition: "cracked",
        body_condition: "minor_wear",
        camera_condition: "clear",
      },
    });
    const newValue = visionRes.result.structuredContent.vision_analysis_result.new_value;
    assert(newValue < initialValue, `Cracked screen value (${newValue}) must be < good initial (${initialValue})`);
  });

  await test("Cracked screen must NOT be graded as 'good' overall", async () => {
    await initializeSession();
    const appraisalRes = await callTool("start_tradein_appraisal", {
      device_model: "Galaxy S25",
      storage_capacity: "256GB",
      device_condition: "good",
      region: "KR",
      carrier: "unlocked",
    });
    const apprId = appraisalRes.result.structuredContent.appraisal_id;

    await initializeSession();
    const visionRes = await callTool("analyze_tradein_device", {
      appraisal_id: apprId,
      vision_analysis: {
        screen_condition: "cracked",
        body_condition: "minor_wear",
        camera_condition: "clear",
      },
    });
    const overallGrade = visionRes.result.structuredContent.vision_analysis_result.overall_grade;
    assert(
      overallGrade === "fair" || overallGrade === "poor",
      `Cracked screen overall grade should be fair or poor, got: ${overallGrade}`
    );
  });

  await test("Monotonicity: excellent Vision value >= cracked Vision value", async () => {
    // Excellent vision
    await initializeSession();
    const appr1Res = await callTool("start_tradein_appraisal", {
      device_model: "Galaxy S24 Ultra",
      storage_capacity: "256GB",
      device_condition: "good",
      region: "US",
      carrier: "unlocked",
    });
    const appr1Id = appr1Res.result.structuredContent.appraisal_id;

    await initializeSession();
    const vision1Res = await callTool("analyze_tradein_device", {
      appraisal_id: appr1Id,
      vision_analysis: {
        screen_condition: "no_scratches",
        body_condition: "pristine",
        camera_condition: "clear",
      },
    });
    const excellentValue = vision1Res.result.structuredContent.vision_analysis_result.new_value;

    // Cracked vision
    await initializeSession();
    const appr2Res = await callTool("start_tradein_appraisal", {
      device_model: "Galaxy S24 Ultra",
      storage_capacity: "256GB",
      device_condition: "good",
      region: "US",
      carrier: "unlocked",
    });
    const appr2Id = appr2Res.result.structuredContent.appraisal_id;

    await initializeSession();
    const vision2Res = await callTool("analyze_tradein_device", {
      appraisal_id: appr2Id,
      vision_analysis: {
        screen_condition: "cracked",
        body_condition: "dents_scratches",
        camera_condition: "scratched",
      },
    });
    const crackedValue = vision2Res.result.structuredContent.vision_analysis_result.new_value;

    assert(excellentValue > crackedValue, `Excellent (${excellentValue}) should be > cracked (${crackedValue})`);
  });

  // --- Tool: compare_galaxy_club_cost ---
  console.log("\n📌 Tool: compare_galaxy_club_cost");
  await test("Compares cost for S25 Ultra Premium", async () => {
    await initializeSession();
    const res = await callTool("compare_galaxy_club_cost", {
      device_model: "Galaxy S25 Ultra",
      plan_type: "premium",
    });
    const sc = res.result.structuredContent;
    assert(sc.comparison, "No comparison");
    assert(sc.comparison.club, "No club data");
    assert(sc.comparison.outright, "No outright data");
    assert(sc.comparison.club.monthly_cost > 0, "monthly_cost should be > 0");
    assert(sc.comparison.outright.device_price > 0, "device_price should be > 0");
    assert(sc.lifecycle_stages, "No lifecycle_stages");
  });

  await test("Includes trade-in info when device provided", async () => {
    await initializeSession();
    const res = await callTool("compare_galaxy_club_cost", {
      device_model: "Galaxy S25 Ultra",
      plan_type: "premium",
      current_device_tradein: "Galaxy S23 Ultra",
    });
    const sc = res.result.structuredContent;
    assert(sc.tradein_info, "No tradein_info");
    assert(sc.tradein_info.estimated_value > 0, "tradein estimated_value should be > 0");
  });

  // --- Korean Text Check ---
  console.log("\n📌 한글화 검증");
  await test("get_tradein_result returns Korean next_steps", async () => {
    if (!testAppraisalId) { throw new Error("No appraisal ID"); }
    await initializeSession();
    const res = await callTool("get_tradein_result", { appraisal_id: testAppraisalId });
    const sc = res.result.structuredContent;
    const hasKorean = sc.next_steps.some(s => /[가-힣]/.test(s));
    assert(hasKorean, `next_steps should contain Korean text. Got: ${JSON.stringify(sc.next_steps)}`);
  });

  await test("get_tradein_result returns Korean CTA text", async () => {
    if (!testAppraisalId) { throw new Error("No appraisal ID"); }
    await initializeSession();
    const res = await callTool("get_tradein_result", { appraisal_id: testAppraisalId });
    const sc = res.result.structuredContent;
    assert(/[가-힣]/.test(sc.cta.text), `CTA text should be Korean. Got: ${sc.cta.text}`);
  });

  await test("start_tradein_appraisal content text is Korean", async () => {
    await initializeSession();
    const res = await callTool("start_tradein_appraisal", {
      device_model: "Galaxy S24 Ultra",
      device_condition: "good",
    });
    const content = res.result.content;
    assert(content && content.length > 0, "No content");
    const text = content[0].text;
    assert(/[가-힣]/.test(text), `Content text should be Korean. Got: ${text.substring(0, 100)}`);
  });

  // --- Summary ---
  console.log("\n" + "═".repeat(50));
  console.log(`\n📊 결과: ${testsPassed} passed, ${testsFailed} failed (총 ${testsPassed + testsFailed}건)\n`);

  if (failures.length > 0) {
    console.log("❌ 실패 항목:");
    failures.forEach(f => {
      console.log(`   • ${f.name}`);
      console.log(`     → ${f.error}\n`);
    });
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

// --- Run ---
runTests().catch(e => {
  console.error("\n💥 테스트 실행 중 치명적 오류:", e.message);
  console.error("\n서버가 실행 중인지 확인하세요: node dist/index.js");
  process.exit(1);
});
