export function getGalaxyClubWidgetHtml(): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Galaxy Club</title>
  <style>
    :root {
      --samsung-blue: #1428a0;
      --samsung-light-blue: #4a90d9;
      --premium-gold: #c9a227;
      --success-green: #22c55e;
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

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .header h2 {
      font-size: 22px;
      font-weight: 700;
      color: var(--samsung-blue);
    }

    .header .tagline {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .plans-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .plan-card {
      background: var(--bg-card);
      border-radius: var(--border-radius);
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .plan-card.recommended {
      border-color: var(--samsung-blue);
    }

    .plan-card.premium {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
    }

    .plan-card.premium .plan-price,
    .plan-card.premium .plan-name {
      color: var(--premium-gold);
    }

    .recommended-badge {
      display: inline-block;
      background: var(--samsung-blue);
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .plan-name {
      font-size: 18px;
      font-weight: 700;
    }

    .plan-price {
      font-size: 28px;
      font-weight: 700;
      color: var(--samsung-blue);
    }

    .plan-price span {
      font-size: 14px;
      font-weight: 400;
    }

    .plan-cycle {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .plan-card.premium .plan-cycle {
      color: rgba(255,255,255,0.7);
    }

    /* Care+ included value */
    .care-plus-tag {
      display: inline-block;
      background: #eef2ff;
      color: var(--samsung-blue);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .plan-card.premium .care-plus-tag {
      background: rgba(201,162,39,0.2);
      color: var(--premium-gold);
    }

    .benefits-list {
      list-style: none;
      margin-bottom: 16px;
    }

    .benefits-list li {
      font-size: 13px;
      padding: 6px 0;
      padding-left: 24px;
      position: relative;
    }

    .benefits-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #22c55e;
      font-weight: bold;
    }

    .plan-card.premium .benefits-list li::before {
      color: var(--premium-gold);
    }

    .plan-buttons {
      display: flex;
      gap: 8px;
    }

    .plan-cta {
      flex: 1;
      background: var(--samsung-blue);
      color: white;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
    }

    .plan-cta.secondary {
      background: transparent;
      color: var(--samsung-blue);
      border: 2px solid var(--samsung-blue);
    }

    .plan-card.premium .plan-cta {
      background: var(--premium-gold);
      color: #1a1a2e;
    }

    .plan-card.premium .plan-cta.secondary {
      background: transparent;
      color: var(--premium-gold);
      border: 2px solid var(--premium-gold);
    }

    /* Lifecycle Timeline */
    .lifecycle-section {
      margin-top: 20px;
      padding: 16px;
      background: var(--bg-card);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .lifecycle-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      text-align: center;
    }

    .timeline {
      display: flex;
      align-items: flex-start;
      position: relative;
    }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .timeline-step {
      flex: 1;
      text-align: center;
      position: relative;
      opacity: 0;
      animation: fadeSlideUp 0.4s ease-out forwards;
    }

    .timeline-step:nth-child(1) { animation-delay: 0.1s; }
    .timeline-step:nth-child(2) { animation-delay: 0.3s; }
    .timeline-step:nth-child(3) { animation-delay: 0.5s; }
    .timeline-step:nth-child(4) { animation-delay: 0.7s; }
    .timeline-step:nth-child(5) { animation-delay: 0.9s; }

    .timeline-step .node {
      width: 32px;
      height: 32px;
      background: var(--samsung-blue);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      margin: 0 auto 8px;
      position: relative;
      z-index: 1;
    }

    .timeline-step:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 16px;
      left: calc(50% + 16px);
      right: calc(-50% + 16px);
      height: 2px;
      background: var(--samsung-blue);
      opacity: 0.3;
    }

    .timeline-step .step-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .timeline-step .step-month {
      font-size: 10px;
      color: var(--samsung-blue);
      font-weight: 600;
      margin-top: 2px;
    }

    .timeline-step .step-desc {
      font-size: 10px;
      color: var(--text-secondary);
      margin-top: 2px;
      line-height: 1.3;
    }

    /* Enrollment Steps */
    .enrollment-section {
      margin-top: 20px;
      padding: 16px;
      background: var(--bg-card);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .enrollment-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .enrollment-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 8px 0;
    }

    .enrollment-step .step-num {
      width: 24px;
      height: 24px;
      background: var(--samsung-blue);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .enrollment-step .step-text {
      font-size: 13px;
      line-height: 1.4;
    }

    .faq-section {
      margin-top: 24px;
    }

    .faq-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .faq-item {
      background: var(--bg-card);
      border-radius: 8px;
      margin-bottom: 8px;
      overflow: hidden;
    }

    .faq-question {
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .faq-answer {
      padding: 0 16px 12px;
      font-size: 13px;
      color: var(--text-secondary);
      display: none;
    }

    .faq-item.open .faq-answer {
      display: block;
    }

    .plan-tabs {
      display: flex;
      background: var(--bg-page);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 16px;
      gap: 4px;
    }

    .plan-tab {
      flex: 1;
      padding: 10px 8px;
      border-radius: 8px;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s ease;
      text-align: center;
      font-family: inherit;
    }

    .plan-tab:hover {
      color: var(--text-primary);
      background: rgba(255,255,255,0.5);
    }

    .plan-tab.active {
      background: white;
      color: var(--samsung-blue);
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }

    .plan-tab .tab-price {
      display: block;
      font-size: 11px;
      font-weight: 400;
      margin-top: 2px;
      color: var(--text-secondary);
    }

    .plan-tab.active .tab-price {
      color: var(--samsung-blue);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .plan-card {
      animation: fadeIn 0.3s ease-out;
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
    .skeleton-tagline { height: 16px; width: 60%; margin: 0 auto 20px; }
    .skeleton-card { height: 280px; width: 100%; border-radius: 12px; margin-bottom: 16px; }
    .skeleton-timeline { height: 80px; width: 100%; border-radius: 12px; }

    .loading-skeleton { padding: 16px; }

    .device-selector {
      background: var(--bg-page);
      border-radius: 8px;
      padding: 14px 16px;
      margin: 16px 0;
    }

    .device-selector .selector-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .device-selector select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      font-size: 13px;
      font-family: inherit;
      background: white;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23666'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      transition: border-color 0.2s;
    }

    .device-selector select:focus {
      outline: none;
      border-color: var(--samsung-blue);
    }

    .compare-cta {
      margin-top: 10px;
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      background: var(--samsung-blue);
      color: white;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .compare-cta:hover { background: #0d1f7a; }

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
  </style>
</head>
<body>
  <div id="content">
    <div class="loading-skeleton">
      <div class="skeleton skeleton-header"></div>
      <div class="skeleton skeleton-tagline"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-timeline"></div>
    </div>
  </div>

  <script>
    // ===== RPC Bridge =====
    let rpcId = 0;
    const pendingRequests = new Map();
    let bridgeReady = null;

    const rpcNotify = (method, params) => {
      window.parent.postMessage({ jsonrpc: '2.0', method, params }, '*');
    };

    const rpcRequest = (method, params) =>
      new Promise((resolve, reject) => {
        const id = ++rpcId;
        pendingRequests.set(id, { resolve, reject });
        window.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*');
      });

    const initializeBridge = async () => {
      try {
        await rpcRequest('ui/initialize', {
          appInfo: { name: 'galaxy-club-widget', version: '1.0.0' },
          appCapabilities: {},
          protocolVersion: '2026-01-26',
        });
        rpcNotify('ui/notifications/initialized', {});
      } catch (e) {
        console.error('Bridge init failed:', e);
      }
    };

    bridgeReady = initializeBridge();

    const content = document.getElementById('content');

    function renderGalaxyClub(data) {
      if (!data || !data.plans) {
        content.innerHTML = '<div class="card"><div class="error-state"><div class="error-icon">😥</div><div class="error-title">플랜 정보를 불러올 수 없습니다</div><div class="error-desc">일시적인 오류가 발생했습니다.<br>잠시 후 다시 시도해 주세요.</div><button class="retry-button" onclick="location.reload()">다시 시도</button></div></div>';
        return;
      }

      // Store plans for tab switching
      window._clubPlans = data.plans;
      window._clubData = data;

      // Determine initial selected plan (recommended or first), restoring saved state if available
      const savedState = window.openai?.widgetState;
      const recommendedPlan = data.plans.find(p => p.is_recommended) || data.plans[0];
      const selectedPlanId = savedState?.selectedTab || recommendedPlan.id;

      // Build tab bar
      const tabsHtml = '<div class="plan-tabs">' + data.plans.map(plan =>
        '<button class="plan-tab ' + (plan.id === selectedPlanId ? 'active' : '') + '" onclick="switchTab(\\'' + plan.id + '\\')">' +
        plan.name + '<span class="tab-price">$' + plan.monthly_price + '/월</span></button>'
      ).join('') + '</div>';

      // Build single plan card for selected plan
      const initialPlan = data.plans.find(p => p.id === selectedPlanId) || recommendedPlan;
      const planCardHtml = buildPlanCard(initialPlan);

      // Device selector for cost comparison
      const deviceSelectorHtml = \`
        <div class="device-selector">
          <div class="selector-label">📱 기기를 선택하여 비용 비교</div>
          <select id="device-select">
            <option value="">기기를 선택하세요</option>
            <option value="Galaxy S25 Ultra">Galaxy S25 Ultra ($1,299)</option>
            <option value="Galaxy S25+">Galaxy S25+ ($999)</option>
            <option value="Galaxy S25">Galaxy S25 ($799)</option>
            <option value="Galaxy Z Fold6">Galaxy Z Fold6 ($1,899)</option>
            <option value="Galaxy Z Flip6">Galaxy Z Flip6 ($1,099)</option>
            <option value="Galaxy Tab S10 Ultra">Galaxy Tab S10 Ultra ($1,199)</option>
          </select>
          <button class="compare-cta" onclick="compareWithDevice(null)">비용 비교하기</button>
        </div>
      \`;

      // Lifecycle timeline
      const lifecycle = data.lifecycle_stages || [];
      let lifecycleHtml = '';
      if (lifecycle.length > 0) {
        lifecycleHtml = \`
          <div class="lifecycle-section">
            <div class="lifecycle-title">Galaxy Club 라이프사이클</div>
            <div class="timeline">
              \${lifecycle.map((stage, i) => \`
                <div class="timeline-step">
                  <div class="node">\${i + 1}</div>
                  <div class="step-label">\${stage.label}</div>
                  \${stage.month ? '<div class="step-month">' + stage.month + '개월</div>' : ''}
                  \${stage.description ? '<div class="step-desc">' + stage.description + '</div>' : ''}
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      }

      // Enrollment steps
      const steps = data.enrollment_steps || [];
      let enrollmentHtml = '';
      if (steps.length > 0) {
        enrollmentHtml = \`
          <div class="enrollment-section">
            <div class="enrollment-title">가입 절차</div>
            \${steps.map((step, i) => \`
              <div class="enrollment-step">
                <span class="step-num">\${i + 1}</span>
                <span class="step-text">\${step}</span>
              </div>
            \`).join('')}
          </div>
        \`;
      }

      const faqHtml = data.faq && data.faq.length > 0 ? \`
        <div class="faq-section">
          <h3 class="faq-title">자주 묻는 질문</h3>
          \${data.faq.map((faq, i) => \`
            <div class="faq-item" onclick="toggleFaq(this)">
              <div class="faq-question">
                <span>\${faq.question}</span>
                <span>▼</span>
              </div>
              <div class="faq-answer">\${faq.answer}</div>
            </div>
          \`).join('')}
        </div>
      \` : '';

      content.innerHTML = \`
        <div class="header">
          <h2>\${data.service_name || 'New Galaxy Club'}</h2>
          <p class="tagline">\${data.tagline || '항상 최신 Galaxy를 사용하세요'}</p>
        </div>
        \${tabsHtml}
        <div id="plan-card-container">
          \${planCardHtml}
        </div>
        \${deviceSelectorHtml}
        \${lifecycleHtml}
        \${enrollmentHtml}
        \${faqHtml}
      \`;

      // Restore FAQ open/close states from saved widget state
      if (savedState?.faqStates) {
        document.querySelectorAll('.faq-item').forEach((el, i) => {
          if (savedState.faqStates[i]) el.classList.add('open');
        });
      }
    }

    function buildPlanCard(plan) {
      const isPremium = plan.id.includes('premium') || plan.id.includes('family');
      const isRecommended = plan.is_recommended;
      const carePlusBenefit = plan.benefits.find(b => b.includes('Care+'));
      const carePlusValue = carePlusBenefit ? carePlusBenefit.match(/\\$([\\d.]+)/)?.[1] : null;

      return '<div class="plan-card ' + (isPremium ? 'premium' : '') + ' ' + (isRecommended ? 'recommended' : '') + '">' +
        (isRecommended ? '<span class="recommended-badge">★ 추천</span>' : '') +
        '<div class="plan-header">' +
          '<div class="plan-name">' + plan.name + '</div>' +
          '<div class="plan-price">$' + plan.monthly_price + '<span>/mo</span></div>' +
        '</div>' +
        '<div class="plan-cycle">' + plan.upgrade_cycle_months + '개월마다 업그레이드</div>' +
        (carePlusValue ? '<span class="care-plus-tag">Care+ 포함 ($' + carePlusValue + '/월 가치)</span>' : '') +
        '<ul class="benefits-list">' +
          plan.benefits.slice(0, 6).map(b => '<li>' + b + '</li>').join('') +
        '</ul>' +
        '<div class="plan-buttons">' +
          '<button class="plan-cta" onclick="selectPlan(\\'' + plan.id + '\\')">' + plan.name + ' 선택하기</button>' +
          '<button class="plan-cta secondary" onclick="compareCost(\\'' + plan.id + '\\', \\'' + plan.name + '\\')">비용 비교하기</button>' +
        '</div>' +
      '</div>';
    }

    function switchTab(planId) {
      const plans = window._clubPlans;
      if (!plans) return;
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // Update active tab
      document.querySelectorAll('.plan-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('onclick').includes(planId)) {
          tab.classList.add('active');
        }
      });

      // Save selected tab state
      window._selectedTab = planId;
      window.openai?.setWidgetState?.({ selectedTab: planId, faqStates: Array.from(document.querySelectorAll('.faq-item')).map(el => el.classList.contains('open')) });

      // Re-render plan card with animation
      const container = document.getElementById('plan-card-container');
      if (container) {
        container.innerHTML = buildPlanCard(plan);
      }
    }

    function toggleFaq(element) {
      element.classList.toggle('open');
      const faqStates = Array.from(document.querySelectorAll('.faq-item')).map(el => el.classList.contains('open'));
      window.openai?.setWidgetState?.({ selectedTab: window._selectedTab, faqStates });
    }

    function selectPlan(planId) {
      window.parent.postMessage({
        jsonrpc: '2.0',
        method: 'ui/message',
        params: {
          role: 'user',
          content: [{ type: 'text', text: planId.replace('ngc-', '') + ' 플랜에 가입하고 싶습니다. 다음 단계를 알려주세요.' }]
        }
      }, '*');
    }

    function compareCost(planId, planName) {
      const select = document.getElementById('device-select');
      if (select && select.value) {
        compareWithDevice(planId);
        return;
      }
      window.parent.postMessage({
        jsonrpc: '2.0',
        method: 'ui/message',
        params: {
          role: 'user',
          content: [{ type: 'text', text: 'Galaxy Club ' + planName + '과 일시불 구매 비용을 비교해주세요.' }]
        }
      }, '*');
    }

    async function compareWithDevice(planId) {
      const select = document.getElementById('device-select');
      if (!select || !select.value) {
        alert('기기를 선택해주세요.');
        return;
      }
      const deviceModel = select.value;
      const planType = planId ? planId.replace('ngc-', '') : 'premium';
      try {
        await bridgeReady;
        const response = await rpcRequest('tools/call', {
          name: 'compare_galaxy_club_cost',
          arguments: { device_model: deviceModel, plan_type: planType }
        });
        // Result will come through ui/notifications/tool-result
      } catch (e) {
        // Fallback to ui/message
        window.parent.postMessage({
          jsonrpc: '2.0', method: 'ui/message',
          params: { role: 'user', content: [{ type: 'text', text: deviceModel + '로 Galaxy Club ' + planType + ' 비용 비교를 해주세요.' }] }
        }, '*');
      }
    }

    // Listen for tool results and RPC responses
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

      // Handle notifications
      if (message.method === 'ui/notifications/tool-result') {
        renderGalaxyClub(message.params?.structuredContent);
      }
    }, { passive: true });

    // Listen for ChatGPT set_globals event
    window.addEventListener('openai:set_globals', (event) => {
      const data = event.detail?.globals?.toolOutput || window.openai?.toolOutput;
      if (data) renderGalaxyClub(data);
    }, { passive: true });

    // Initial render - toolOutput IS the structuredContent directly
    if (window.openai?.toolOutput) {
      renderGalaxyClub(window.openai.toolOutput);
    }
  </script>
</body>
</html>
  `.trim();
}
