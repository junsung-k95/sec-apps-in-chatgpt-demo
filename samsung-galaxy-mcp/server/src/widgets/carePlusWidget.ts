export function getCarePlusWidgetHtml(): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Samsung Care+</title>
  <style>
    :root {
      --samsung-blue: #1428a0;
      --samsung-light-blue: #4a90d9;
      --success-green: #22c55e;
      --warning-yellow: #f59e0b;
      --danger-red: #ef4444;
      --text-primary: #1a1a1a;
      --text-secondary: #666;
      --bg-card: #ffffff;
      --bg-page: #f5f5f5;
      --border-radius: 12px;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --text-primary: #e5e5e5;
        --text-secondary: #a0a0a0;
        --bg-card: #2d2d2d;
        --bg-page: #1a1a1a;
      }
      body { color-scheme: dark; }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'SamsungOne', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-page);
      padding: 16px;
      color: var(--text-primary);
    }

    .card {
      background: var(--bg-card);
      border-radius: var(--border-radius);
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .header {
      text-align: center;
      margin-bottom: 16px;
    }

    .header h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--samsung-blue);
    }

    .header .subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    /* Enrollment Status Banner */
    .enrollment-banner {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }

    .enrollment-banner.immediate {
      background: #dcfce7;
      color: #166534;
    }

    .enrollment-banner.late {
      background: #fef3c7;
      color: #92400e;
    }

    .enrollment-banner.expired {
      background: #fee2e2;
      color: #991b1b;
    }

    .enrollment-banner.approved {
      background: #dcfce7;
      color: #166534;
    }

    .enrollment-banner.rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .enrollment-banner .icon {
      margin-right: 6px;
    }

    /* Plans Comparison */
    .plans-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .plan-col {
      background: var(--bg-page);
      border-radius: 8px;
      padding: 16px;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .plan-col.recommended {
      border-color: var(--samsung-blue);
    }

    .plan-col.selected {
      border-color: var(--samsung-blue);
      background: #eef2ff;
      position: relative;
    }

    .plan-col.selected::after {
      content: '✓';
      position: absolute;
      top: 8px;
      right: 10px;
      width: 20px;
      height: 20px;
      background: var(--samsung-blue);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
    }

    .plan-col .plan-badge {
      display: inline-block;
      background: var(--samsung-blue);
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .plan-col .plan-name {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .plan-col .plan-price {
      font-size: 24px;
      font-weight: 700;
      color: var(--samsung-blue);
      margin-bottom: 8px;
    }

    .plan-col .plan-price span {
      font-size: 13px;
      font-weight: 400;
    }

    .plan-col .coverage-list {
      list-style: none;
      margin-bottom: 8px;
    }

    .plan-col .coverage-list li {
      font-size: 12px;
      padding: 3px 0;
      padding-left: 18px;
      position: relative;
      color: var(--text-secondary);
    }

    .plan-col .coverage-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--success-green);
      font-weight: bold;
      font-size: 11px;
    }

    .deductible-row {
      font-size: 11px;
      color: var(--text-secondary);
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
    }

    .deductible-label {
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    /* Vision Assessment */
    .vision-section {
      margin: 16px 0;
      padding: 16px;
      background: var(--bg-page);
      border-radius: 8px;
    }

    .vision-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .condition-grid {
      display: flex;
      gap: 12px;
    }

    .condition-item {
      flex: 1;
      text-align: center;
      padding: 12px 8px;
      background: white;
      border-radius: 8px;
    }

    .condition-item .condition-icon {
      font-size: 28px;
      margin-bottom: 4px;
    }

    .condition-item .condition-label {
      font-size: 11px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .condition-item .condition-value {
      font-size: 12px;
      font-weight: 600;
    }

    .condition-item .condition-value.excellent,
    .condition-item .condition-value.pass {
      color: var(--success-green);
    }

    .condition-item .condition-value.good {
      color: var(--success-green);
    }

    .condition-item .condition-value.fair {
      color: var(--warning-yellow);
    }

    .condition-item .condition-value.poor,
    .condition-item .condition-value.fail {
      color: var(--danger-red);
    }

    /* FAQ */
    .faq-section {
      margin-top: 16px;
    }

    .faq-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .faq-item {
      background: var(--bg-page);
      border-radius: 8px;
      margin-bottom: 6px;
      overflow: hidden;
    }

    .faq-question {
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .faq-answer {
      padding: 0 14px 10px;
      font-size: 12px;
      color: var(--text-secondary);
      display: none;
    }

    .faq-item.open .faq-answer {
      display: block;
    }

    /* CTA Buttons */
    .cta-container {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .cta-button {
      flex: 1;
      padding: 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      border: none;
    }

    .cta-button.primary {
      background: var(--samsung-blue);
      color: white;
    }

    .cta-button.primary:hover {
      background: #0d1f7a;
    }

    .cta-button.secondary {
      background: white;
      color: var(--samsung-blue);
      border: 2px solid var(--samsung-blue);
    }

    .error-state {
      text-align: center;
      padding: 32px 20px;
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .error-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .error-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .retry-button {
      padding: 10px 24px;
      border-radius: 8px;
      background: var(--samsung-blue);
      color: white;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s;
    }

    .retry-button:hover { background: #0d1f7a; }

    .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }

    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      border-radius: 6px;
    }

    .skeleton-header { height: 28px; width: 50%; margin: 0 auto 8px; }
    .skeleton-subtitle { height: 16px; width: 70%; margin: 0 auto 16px; }
    .skeleton-banner { height: 40px; width: 100%; margin-bottom: 16px; }
    .skeleton-plan { height: 200px; width: 100%; margin-bottom: 12px; }
    .skeleton-button { height: 44px; width: 100%; }

    .loading-skeleton { padding: 20px; }
  </style>
</head>
<body>
  <div id="content">
    <div class="card loading-skeleton">
      <div class="skeleton skeleton-header"></div>
      <div class="skeleton skeleton-subtitle"></div>
      <div class="skeleton skeleton-banner"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="skeleton skeleton-plan"></div>
        <div class="skeleton skeleton-plan"></div>
      </div>
      <div class="skeleton skeleton-button" style="margin-top:16px"></div>
    </div>
  </div>

  <script>
    // ===== RPC Bridge (for ui/update-model-context) =====
    let rpcId = 0;
    const pendingRequests = new Map();

    const rpcRequest = (method, params) =>
      new Promise((resolve, reject) => {
        const id = ++rpcId;
        pendingRequests.set(id, { resolve, reject });
        window.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*');
      });

    const content = document.getElementById('content');
    let selectedPlanId = null;
    let currentCarePlusData = null;

    function detectRegion() {
      const lang = navigator.language || '';
      if (lang.startsWith('ko')) return 'KR';
      if (lang.startsWith('ja')) return 'JP';
      if (lang === 'en-GB') return 'UK';
      if (lang.startsWith('de')) return 'DE';
      return null;
    }

    function fmtCarePlusPrice(usdValue) {
      const region = detectRegion();
      const rates = currentCarePlusData?.currency_rates;
      if (!region || !rates || !rates[region] || !rates[region].base_rate) return '$' + usdValue;
      const local = Math.round(usdValue * rates[region].base_rate);
      if (region === 'KR') return local.toLocaleString() + '원';
      return (rates[region].symbol || '') + local.toLocaleString();
    }

    // Restore selected plan from saved widget state
    const savedState = window.openai?.widgetState;
    if (savedState?.selectedPlan) {
      selectedPlanId = savedState.selectedPlan;
    }

    function saveFaqState() {
      const faqStates = Array.from(document.querySelectorAll('.faq-item')).map(el => el.classList.contains('open'));
      window.openai?.setWidgetState?.({ faqStates, selectedPlan: selectedPlanId });
    }

    function renderCarePlus(data) {
      currentCarePlusData = data;
      if (!data) {
        content.innerHTML = '<div class="card"><div class="error-state"><div class="error-icon">😥</div><div class="error-title">정보를 불러올 수 없습니다</div><div class="error-desc">일시적인 오류가 발생했습니다.<br>잠시 후 다시 시도해 주세요.</div><button class="retry-button" onclick="location.reload()">다시 시도</button></div></div>';
        return;
      }

      // Enrollment banner
      let bannerHtml = '';
      if (data.enrollment_status) {
        const s = data.enrollment_status;
        if (s.status === 'eligible_immediate') {
          bannerHtml = '<div class="enrollment-banner immediate"><span class="icon">✅</span>즉시 가입 가능</div>';
        } else if (s.status === 'eligible_late_enrollment') {
          bannerHtml = '<div class="enrollment-banner late"><span class="icon">⚠️</span>구매 후 60일 초과 — Vision 검사로 Late Enrollment 가능</div>';
        } else if (s.status === 'expired') {
          bannerHtml = '<div class="enrollment-banner expired"><span class="icon">❌</span>가입 기간 만료 (구매 후 1년 초과)</div>';
        }
      }

      // Vision eligibility result
      if (data.eligibility_result) {
        const r = data.eligibility_result;
        if (r.eligible) {
          bannerHtml = '<div class="enrollment-banner approved"><span class="icon">✅</span>Late Enrollment 승인! Care+ 가입 가능합니다.</div>';
        } else {
          bannerHtml = '<div class="enrollment-banner rejected"><span class="icon">❌</span>기기 상태가 기준을 충족하지 않습니다.</div>';
        }
      }

      // Plans
      const plans = data.plans || [];
      let plansHtml = '';
      if (plans.length > 0) {
        plansHtml = '<div class="plans-grid">' + plans.map(plan => {
          const isRecommended = plan.is_recommended;
          const deductible = plan.deductible || {};
          return \`
            <div class="plan-col \${isRecommended ? 'recommended' : ''} \${selectedPlanId === plan.id ? 'selected' : ''}" onclick="selectCarePlan('\${plan.id}')" style="cursor:pointer">
              \${isRecommended ? '<span class="plan-badge">추천</span>' : ''}
              <div class="plan-name">\${plan.name}</div>
              <div class="plan-price">\${fmtCarePlusPrice(plan.monthly_price)}<span>/월</span></div>
              <ul class="coverage-list">
                \${(plan.coverage || []).map(c => '<li>' + c + '</li>').join('')}
              </ul>
              <div class="deductible-label">자기부담금</div>
              \${deductible.screen_repair !== undefined ? '<div class="deductible-row"><span>화면 수리</span><span>' + fmtCarePlusPrice(deductible.screen_repair) + '</span></div>' : ''}
              \${deductible.other_repair !== undefined ? '<div class="deductible-row"><span>기타 수리</span><span>' + fmtCarePlusPrice(deductible.other_repair) + '</span></div>' : ''}
              \${deductible.replacement !== undefined ? '<div class="deductible-row"><span>교체</span><span>' + fmtCarePlusPrice(deductible.replacement) + '</span></div>' : ''}
            </div>
          \`;
        }).join('') + '</div>';
      }

      // Vision condition indicators
      let visionHtml = '';
      if (data.vision_assessment || data.eligibility_result?.vision_assessment) {
        const va = data.vision_assessment || data.eligibility_result?.vision_assessment;
        const getGrade = (condition) => {
          const grades = { no_scratches: 'excellent', light_scratches: 'good', visible_scratches: 'fair', cracked: 'poor', pristine: 'excellent', minor_wear: 'good', dents_scratches: 'fair', major_damage: 'poor', clear: 'excellent', minor_smudge: 'good', scratched: 'fair' };
          return grades[condition] || 'fair';
        };
        const getIcon = (grade) => {
          if (grade === 'excellent' || grade === 'good') return '🟢';
          if (grade === 'fair') return '🟡';
          return '🔴';
        };
        const formatLabel = (s) => s.replace(/_/g, ' ');

        visionHtml = \`
          <div class="vision-section">
            <div class="vision-title">기기 상태 분석 결과</div>
            <div class="condition-grid">
              \${va.screen_condition ? \`
                <div class="condition-item">
                  <div class="condition-icon">\${getIcon(getGrade(va.screen_condition))}</div>
                  <div class="condition-label">화면</div>
                  <div class="condition-value \${getGrade(va.screen_condition)}">\${formatLabel(va.screen_condition)}</div>
                </div>
              \` : ''}
              \${va.body_condition ? \`
                <div class="condition-item">
                  <div class="condition-icon">\${getIcon(getGrade(va.body_condition))}</div>
                  <div class="condition-label">외관</div>
                  <div class="condition-value \${getGrade(va.body_condition)}">\${formatLabel(va.body_condition)}</div>
                </div>
              \` : ''}
              \${va.camera_condition ? \`
                <div class="condition-item">
                  <div class="condition-icon">\${getIcon(getGrade(va.camera_condition))}</div>
                  <div class="condition-label">카메라</div>
                  <div class="condition-value \${getGrade(va.camera_condition)}">\${formatLabel(va.camera_condition)}</div>
                </div>
              \` : ''}
            </div>
          </div>
        \`;
      }

      // FAQ — 최대 3개만 표시
      const allFaqs = data.faq || [];
      const faqs = allFaqs.slice(0, 3);
      let faqHtml = '';
      if (faqs.length > 0) {
        faqHtml = \`
          <div class="faq-section">
            <h3 class="faq-title">자주 묻는 질문</h3>
            \${faqs.map(faq => \`
              <div class="faq-item" onclick="this.classList.toggle('open'); saveFaqState()">
                <div class="faq-question"><span>\${faq.question}</span><span>▼</span></div>
                <div class="faq-answer">\${faq.answer}</div>
              </div>
            \`).join('')}
            \${allFaqs.length > 3 ? '<div style="text-align:center;padding:8px;font-size:12px;color:var(--text-secondary)">더 많은 질문이 있으시면 채팅으로 물어보세요</div>' : ''}
          </div>
        \`;
      }

      // CTA buttons
      let ctaHtml = '<div class="cta-container">';
      if (data.eligibility_result?.eligible || (data.enrollment_status && data.enrollment_status.status === 'eligible_immediate')) {
        if (selectedPlanId) {
          const selectedPlan = plans.find(p => p.id === selectedPlanId);
          const planLabel = selectedPlan ? selectedPlan.name : 'Care+';
          ctaHtml += '<button class="cta-button primary" onclick="enrollCarePlus(\\'' + selectedPlanId + '\\')">' + planLabel + ' 가입하기</button>';
        } else {
          ctaHtml += '<button class="cta-button primary" style="opacity:0.6" disabled>플랜을 선택해주세요</button>';
        }
      } else if (data.enrollment_status?.status === 'eligible_late_enrollment') {
        if (selectedPlanId) {
          const selectedPlan = plans.find(p => p.id === selectedPlanId);
          const planLabel = selectedPlan ? selectedPlan.name : 'Care+';
          ctaHtml += '<button class="cta-button primary" onclick="enrollCarePlus(\\'' + selectedPlanId + '\\')">' + planLabel + ' 가입 상담하기</button>';
        } else {
          ctaHtml += '<button class="cta-button primary" style="opacity:0.6" disabled>플랜을 선택해주세요</button>';
        }
      } else if (data.eligibility_result && !data.eligibility_result.eligible) {
        ctaHtml += '<button class="cta-button primary" onclick="openCustomerCenter()">고객센터에 상세 문의하기</button>';
      } else {
        if (selectedPlanId) {
          const selectedPlan = plans.find(p => p.id === selectedPlanId);
          const planLabel = selectedPlan ? selectedPlan.name : 'Care+';
          ctaHtml += '<button class="cta-button primary" onclick="enrollCarePlus(\\'' + selectedPlanId + '\\')">' + planLabel + ' 가입하기</button>';
        } else {
          ctaHtml += '<button class="cta-button primary" onclick="openCustomerCenter()">고객센터에 상세 문의하기</button>';
        }
      }
      ctaHtml += '</div>';

      content.innerHTML = \`
        <div class="card">
          <div class="header">
            <h2>Samsung Care+</h2>
            <p class="subtitle">\${data.description || '삼성 공식 기기 보험 서비스'}</p>
          </div>
          \${bannerHtml}
          \${plansHtml}
          \${visionHtml}
          \${faqHtml}
          \${ctaHtml}
        </div>
      \`;

      // Restore FAQ open/close states from saved widget state
      if (savedState?.faqStates) {
        setTimeout(() => {
          document.querySelectorAll('.faq-item').forEach((el, i) => {
            if (savedState.faqStates[i]) el.classList.add('open');
          });
        }, 50);
      }
    }

    function selectCarePlan(planId) {
      selectedPlanId = planId;
      window._selectedCarePlan = planId;
      window.openai?.setWidgetState?.({ selectedPlan: planId, faqStates: Array.from(document.querySelectorAll('.faq-item')).map(el => el.classList.contains('open')) });
      const plan = (currentCarePlusData?.plans || []).find(p => p.id === planId);
      const planName = plan ? plan.name : planId;
      rpcRequest('ui/update-model-context', {
        content: [{ type: 'text', text: '사용자가 ' + planName + ' 플랜을 선택했습니다.' }]
      }).catch(() => {});
      if (currentCarePlusData) renderCarePlus(currentCarePlusData);
    }

    function enrollCarePlus(planId) {
      const plan = (currentCarePlusData?.plans || []).find(p => p.id === planId);
      const planName = plan ? plan.name : planId;
      window.parent.postMessage({
        jsonrpc: '2.0',
        method: 'ui/message',
        params: {
          role: 'user',
          content: [{ type: 'text', text: planName + '으로 가입할게요. 가입 페이지: https://www.samsung.com/sec/care-plus/' }]
        }
      }, '*');
    }


    function openCustomerCenter() {
      window.open('https://www.samsung.com', '_blank');
    }

    // Listen for tool results
    window.addEventListener('message', (event) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== '2.0') return;

      // Handle RPC responses
      if (typeof message.id === 'number') {
        const pending = pendingRequests.get(message.id);
        if (pending) {
          pendingRequests.delete(message.id);
          if (message.error) pending.reject(message.error);
          else pending.resolve(message.result);
        }
        return;
      }

      if (message.method === 'ui/notifications/tool-result') {
        renderCarePlus(message.params?.structuredContent);
      }
    }, { passive: true });

    window.addEventListener('openai:set_globals', (event) => {
      const data = event.detail?.globals?.toolOutput || window.openai?.toolOutput;
      if (data) renderCarePlus(data);
    }, { passive: true });

    if (window.openai?.toolOutput) {
      renderCarePlus(window.openai.toolOutput);
    }
  </script>
</body>
</html>
  `.trim();
}
