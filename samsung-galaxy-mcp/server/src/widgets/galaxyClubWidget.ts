export function getGalaxyClubWidgetHtml(): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New 갤럭시 AI 구독클럽</title>
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
      .device-row { border-color: #444; }
      .device-row.closed { background: #333; }
      .residual-tag { background: #1e2a5a; color: #93b4f5; }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'SamsungOne', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-page);
      padding: 16px;
      color: var(--text-primary);
    }

    .header { text-align: center; margin-bottom: 20px; }
    .header h2 { font-size: 22px; font-weight: 700; color: var(--samsung-blue); }
    .header .tagline { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }

    /* Plan Tabs */
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

    .plan-tab:hover { color: var(--text-primary); background: rgba(255,255,255,0.5); }
    .plan-tab.active { background: white; color: var(--samsung-blue); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .plan-tab .tab-sub { display: block; font-size: 10px; font-weight: 400; margin-top: 2px; color: var(--text-secondary); }
    .plan-tab.active .tab-sub { color: var(--samsung-blue); }

    /* Plan Card */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .plan-card {
      background: var(--bg-card);
      border-radius: var(--border-radius);
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 2px solid transparent;
      animation: fadeIn 0.3s ease-out;
    }

    .plan-card.recommended { border-color: var(--samsung-blue); }

    .plan-card.premium-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
    }
    .plan-card.premium-card .plan-name { color: var(--premium-gold); }
    .plan-card.premium-card .residual-tag { background: rgba(201,162,39,0.2); color: var(--premium-gold); }
    .plan-card.premium-card .device-row { border-color: rgba(255,255,255,0.1); }
    .plan-card.premium-card .device-model { color: #e5e5e5; }
    .plan-card.premium-card .device-price { color: var(--premium-gold); }
    .plan-card.premium-card .benefits-list li::before { color: var(--premium-gold); }
    .plan-card.premium-card .care-info { background: rgba(201,162,39,0.1); border-color: rgba(201,162,39,0.3); }
    .plan-card.premium-card .plan-cta { background: var(--premium-gold); color: #1a1a2e; }

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

    .plan-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }

    .residual-tag {
      display: inline-block;
      background: #eef2ff;
      color: var(--samsung-blue);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    /* Device Pricing Table */
    .device-table { margin-bottom: 16px; }
    .device-table-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }

    .device-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 13px;
    }

    .device-row:last-child { border-bottom: none; }
    .device-row.closed { opacity: 0.5; }

    .device-model { font-weight: 600; }
    .device-sub { font-size: 11px; color: var(--text-secondary); }
    .device-price { font-weight: 700; color: var(--samsung-blue); white-space: nowrap; }
    .closed-badge { font-size: 10px; color: #ef4444; margin-left: 4px; }

    /* Care+ Info */
    .care-info {
      background: var(--bg-page);
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
      font-size: 12px;
    }

    .care-info-title { font-weight: 600; margin-bottom: 6px; font-size: 12px; }
    .care-info-item { padding: 2px 0; color: var(--text-secondary); }

    /* Benefits */
    .benefits-list { list-style: none; margin-bottom: 16px; }
    .benefits-list li {
      font-size: 13px;
      padding: 5px 0;
      padding-left: 22px;
      position: relative;
    }
    .benefits-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #22c55e;
      font-weight: bold;
    }

    /* Accessory coupon */
    .accessory-info {
      font-size: 12px;
      color: var(--text-secondary);
      padding: 8px 12px;
      background: var(--bg-page);
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .accessory-info .coupon-icon { margin-right: 4px; }

    /* CTA */
    .plan-cta {
      width: 100%;
      background: var(--samsung-blue);
      color: white;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      font-family: inherit;
    }

    .plan-cta:hover { opacity: 0.9; }

    /* Loss/theft notice */
    .loss-notice {
      margin-bottom: 12px;
      padding: 10px 12px;
      background: #fef3c7;
      border-radius: 8px;
      font-size: 11px;
      color: #92400e;
      line-height: 1.5;
    }

    /* Lifecycle Timeline */
    .lifecycle-section {
      margin-top: 20px;
      padding: 16px;
      background: var(--bg-card);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .lifecycle-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; text-align: center; }

    .timeline { display: flex; align-items: flex-start; position: relative; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .timeline-step {
      flex: 1; text-align: center; position: relative;
      opacity: 0; animation: fadeSlideUp 0.4s ease-out forwards;
    }
    .timeline-step:nth-child(1) { animation-delay: 0.1s; }
    .timeline-step:nth-child(2) { animation-delay: 0.3s; }
    .timeline-step:nth-child(3) { animation-delay: 0.5s; }
    .timeline-step:nth-child(4) { animation-delay: 0.7s; }

    .timeline-step .node {
      width: 32px; height: 32px;
      background: var(--samsung-blue); color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
      margin: 0 auto 8px;
      position: relative; z-index: 1;
    }

    .timeline-step:not(:last-child)::after {
      content: '';
      position: absolute; top: 16px;
      left: calc(50% + 16px); right: calc(-50% + 16px);
      height: 2px; background: var(--samsung-blue); opacity: 0.3;
    }

    .timeline-step .step-label { font-size: 11px; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
    .timeline-step .step-desc { font-size: 10px; color: var(--text-secondary); margin-top: 2px; line-height: 1.3; }

    /* Enrollment */
    .enrollment-section {
      margin-top: 20px; padding: 16px;
      background: var(--bg-card);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .enrollment-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .enrollment-step { display: flex; align-items: flex-start; gap: 12px; padding: 8px 0; }
    .enrollment-step .step-num {
      width: 24px; height: 24px;
      background: var(--samsung-blue); color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600; flex-shrink: 0;
    }
    .enrollment-step .step-text { font-size: 13px; line-height: 1.4; }

    /* FAQ */
    .faq-section { margin-top: 24px; }
    .faq-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .faq-item { background: var(--bg-card); border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
    .faq-question {
      padding: 12px 16px; font-size: 13px; font-weight: 600;
      cursor: pointer; display: flex; justify-content: space-between; align-items: center;
    }
    .faq-answer { padding: 0 16px 12px; font-size: 13px; color: var(--text-secondary); display: none; }
    .faq-item.open .faq-answer { display: block; }

    /* Error / Skeleton */
    .error-state { text-align: center; padding: 32px 20px; }
    .error-icon { font-size: 48px; margin-bottom: 12px; }
    .error-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .error-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5; }
    .retry-button {
      padding: 10px 24px; border-radius: 8px;
      background: var(--samsung-blue); color: white; border: none;
      font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    }

    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
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
  </style>
</head>
<body>
  <div id="content">
    <div class="loading-skeleton">
      <div class="skeleton skeleton-header"></div>
      <div class="skeleton skeleton-tagline"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-timeline"></div>
    </div>
  </div>

  <script>
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
          appInfo: { name: 'galaxy-club-widget', version: '2.0.0' },
          appCapabilities: {},
          protocolVersion: '2026-01-26',
        });
        rpcNotify('ui/notifications/initialized', {});
      } catch (e) { console.error('Bridge init failed:', e); }
    };

    bridgeReady = initializeBridge();
    const content = document.getElementById('content');

    function fmtKRW(value) {
      return value.toLocaleString() + '원';
    }

    function renderGalaxyClub(data) {
      if (!data || !data.plans) {
        content.innerHTML = '<div class="card"><div class="error-state"><div class="error-icon">😥</div><div class="error-title">정보를 불러올 수 없습니다</div><div class="error-desc">일시적인 오류가 발생했습니다.</div><button class="retry-button" onclick="location.reload()">다시 시도</button></div></div>';
        return;
      }

      window._clubPlans = data.plans;
      window._clubData = data;

      const savedState = window.openai?.widgetState;
      const recommendedPlan = data.plans.find(p => p.is_recommended) || data.plans[0];
      const selectedPlanId = savedState?.selectedTab || recommendedPlan.id;

      // Tabs
      const tabsHtml = '<div class="plan-tabs">' + data.plans.map(plan => {
        const subText = plan.residual_value_pct ? '잔존가 ' + plan.residual_value_pct + '%' : '';
        return '<button class="plan-tab ' + (plan.id === selectedPlanId ? 'active' : '') + '" onclick="switchTab(\\'' + plan.id + '\\')">' +
          plan.name + (subText ? '<span class="tab-sub">' + subText + '</span>' : '') + '</button>';
      }).join('') + '</div>';

      const initialPlan = data.plans.find(p => p.id === selectedPlanId) || recommendedPlan;
      const planCardHtml = buildPlanCard(initialPlan);

      // Lifecycle
      const lifecycle = data.lifecycle_stages || [];
      let lifecycleHtml = '';
      if (lifecycle.length > 0) {
        lifecycleHtml = '<div class="lifecycle-section"><div class="lifecycle-title">가입부터 반납까지</div><div class="timeline">' +
          lifecycle.map((stage, i) => '<div class="timeline-step"><div class="node">' + (i + 1) + '</div><div class="step-label">' + stage.label + '</div>' +
            (stage.description ? '<div class="step-desc">' + stage.description + '</div>' : '') + '</div>').join('') +
          '</div></div>';
      }

      // Enrollment
      const steps = data.enrollment_steps || [];
      let enrollmentHtml = '';
      if (steps.length > 0) {
        enrollmentHtml = '<div class="enrollment-section"><div class="enrollment-title">가입 절차</div>' +
          steps.map((step, i) => '<div class="enrollment-step"><span class="step-num">' + (i + 1) + '</span><span class="step-text">' + step + '</span></div>').join('') +
          '</div>';
      }

      // FAQ (max 3)
      const faqItems = (data.faq || []).slice(0, 3);
      const faqHtml = faqItems.length > 0 ? '<div class="faq-section"><h3 class="faq-title">자주 묻는 질문</h3>' +
        faqItems.map(faq => '<div class="faq-item" onclick="toggleFaq(this)"><div class="faq-question"><span>' + faq.question + '</span><span>▼</span></div><div class="faq-answer">' + faq.answer + '</div></div>').join('') +
        ((data.faq || []).length > 3 ? '<div style="text-align:center;padding:8px;font-size:12px;color:var(--text-secondary)">더 궁금한 점은 채팅으로 물어보세요</div>' : '') +
        '</div>' : '';

      content.innerHTML =
        '<div class="header"><h2>' + (data.service_name || 'New 갤럭시 AI 구독클럽') + '</h2>' +
        '<p class="tagline">' + (data.tagline || '가입부터 반납까지, Galaxy AI와 함께') + '</p></div>' +
        tabsHtml +
        '<div id="plan-card-container">' + planCardHtml + '</div>' +
        lifecycleHtml + enrollmentHtml + faqHtml;

      if (savedState?.faqStates) {
        document.querySelectorAll('.faq-item').forEach((el, i) => {
          if (savedState.faqStates[i]) el.classList.add('open');
        });
      }
    }

    function buildPlanCard(plan) {
      const is36 = plan.id === 'ngc-36mo';
      const isRecommended = plan.is_recommended;
      const devices = plan.device_pricing || [];

      // Device pricing rows
      const deviceRows = devices.map(d => {
        const isClosed = d.closed;
        return '<div class="device-row' + (isClosed ? ' closed' : '') + '">' +
          '<div><div class="device-model">' + d.model + (isClosed ? '<span class="closed-badge">(가입종료)</span>' : '') + '</div>' +
          (d.sub ? '<div class="device-sub">' + d.sub + '</div>' : '') + '</div>' +
          '<div class="device-price">' + fmtKRW(d.monthly_price) + '/월 ×' + d.payments + '회</div>' +
          '</div>';
      }).join('');

      // Care+ info
      const careInfo = plan.care_plus || {};
      let careHtml = '<div class="care-info"><div class="care-info-title">Samsung Care+ 포함</div>';
      if (careInfo.s26) careHtml += '<div class="care-info-item">• S26: ' + careInfo.s26 + '</div>';
      if (careInfo.others) careHtml += '<div class="care-info-item">• 기타: ' + careInfo.others + '</div>';
      careHtml += '</div>';

      // Accessory coupon
      let accessoryHtml = '';
      if (plan.accessory_coupon) {
        accessoryHtml = '<div class="accessory-info"><span class="coupon-icon">🎁</span>' + plan.accessory_coupon;
        if (plan.accessory_coupon_ultra) accessoryHtml += '<br><span class="coupon-icon">⚡</span>' + plan.accessory_coupon_ultra;
        accessoryHtml += '</div>';
      }

      // Loss/theft notice (36mo only)
      let lossHtml = '';
      if (plan.loss_theft_notice) {
        lossHtml = '<div class="loss-notice">⚠️ ' + plan.loss_theft_notice + '</div>';
      }

      // Benefits
      const benefitsHtml = '<ul class="benefits-list">' +
        (plan.benefits || []).slice(0, 6).map(b => '<li>' + b + '</li>').join('') + '</ul>';

      return '<div class="plan-card' + (is36 ? ' premium-card' : '') + (isRecommended ? ' recommended' : '') + '">' +
        (isRecommended ? '<span class="recommended-badge">★ 추천</span>' : '') +
        (plan.note ? '<span class="recommended-badge" style="background:#92400e;margin-left:4px">' + plan.note + '</span>' : '') +
        '<div class="plan-name">' + plan.name + '</div>' +
        '<div class="residual-tag">' + (plan.residual_value_desc || '') + ' (' + plan.return_window + ' 반납)</div>' +
        '<div class="device-table"><div class="device-table-title">대상 기기 및 이용료</div>' + deviceRows + '</div>' +
        careHtml + lossHtml + accessoryHtml + benefitsHtml +
        '<button class="plan-cta" onclick="selectPlan(\\'' + plan.id + '\\')">' + plan.name + ' 가입하기</button>' +
        '</div>';
    }

    function switchTab(planId) {
      const plans = window._clubPlans;
      if (!plans) return;
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      document.querySelectorAll('.plan-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('onclick').includes(planId)) tab.classList.add('active');
      });

      window._selectedTab = planId;
      window.openai?.setWidgetState?.({ selectedTab: planId, faqStates: Array.from(document.querySelectorAll('.faq-item')).map(el => el.classList.contains('open')) });

      const container = document.getElementById('plan-card-container');
      if (container) container.innerHTML = buildPlanCard(plan);
    }

    function toggleFaq(element) {
      element.classList.toggle('open');
      const faqStates = Array.from(document.querySelectorAll('.faq-item')).map(el => el.classList.contains('open'));
      window.openai?.setWidgetState?.({ selectedTab: window._selectedTab, faqStates });
    }

    function selectPlan(planId) {
      window.parent.postMessage({
        jsonrpc: '2.0', method: 'ui/message',
        params: { role: 'user', content: [{ type: 'text', text: planId.replace('ngc-', '') + ' 플랜에 가입하고 싶습니다. 가입 페이지: https://www.samsung.com/sec/smartphones/galaxy-s26-ultra/buy/' }] }
      }, '*');
    }

    window.addEventListener('message', (event) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== '2.0') return;
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
        renderGalaxyClub(message.params?.structuredContent);
      }
    }, { passive: true });

    window.addEventListener('openai:set_globals', (event) => {
      const data = event.detail?.globals?.toolOutput || window.openai?.toolOutput;
      if (data) renderGalaxyClub(data);
    }, { passive: true });

    if (window.openai?.toolOutput) {
      renderGalaxyClub(window.openai.toolOutput);
    }
  </script>
</body>
</html>
  `.trim();
}
