export function getComparisonWidgetHtml(): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Galaxy Club vs 일반 구매 비교</title>
  <style>
    :root {
      --samsung-blue: #1428a0;
      --samsung-light-blue: #4a90d9;
      --success-green: #22c55e;
      --premium-gold: #c9a227;
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
      .compare-col { background: #333; }
      .tradein-section { background: #3a2e00; color: #fde68a; }
      .compare-col.outright .col-badge { background: #4b5563; color: #d1d5db; }
      .benefit-tag { background: #1e2a5e; color: #93b4f5; }
      .period-ticks { color: #a0a0a0; }
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
      font-size: 18px;
      font-weight: 700;
    }

    .header .device-name {
      font-size: 14px;
      color: var(--samsung-blue);
      font-weight: 600;
      margin-top: 4px;
    }

    /* Savings Banner */
    .savings-banner {
      background: var(--samsung-blue);
      color: white;
      text-align: center;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .savings-banner .savings-amount {
      font-size: 28px;
      font-weight: 700;
    }

    .savings-banner .savings-label {
      font-size: 12px;
      opacity: 0.9;
    }

    /* Comparison Grid */
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .compare-col {
      background: var(--bg-page);
      border-radius: 8px;
      padding: 16px;
    }

    .compare-col.club {
      border: 2px solid var(--samsung-blue);
    }

    .compare-col .col-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .compare-col.club .col-badge {
      background: var(--samsung-blue);
      color: white;
    }

    .compare-col.outright .col-badge {
      background: #e5e7eb;
      color: #374151;
    }

    .compare-col .col-title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .cost-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 12px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .cost-row:last-child {
      border-bottom: none;
    }

    .cost-row.total {
      font-weight: 700;
      font-size: 14px;
      padding-top: 8px;
      border-top: 2px solid rgba(0,0,0,0.1);
    }

    .cost-row .positive {
      color: var(--success-green);
    }

    .cost-row .highlight {
      color: var(--samsung-blue);
      font-weight: 600;
    }

    /* Trade-in Section */
    .tradein-section {
      background: #fef3c7;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      font-size: 12px;
    }

    .tradein-section .tradein-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    /* Benefits */
    .benefits-section {
      margin-bottom: 16px;
    }

    .benefits-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .benefit-tag {
      display: inline-block;
      background: #eef2ff;
      color: var(--samsung-blue);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      margin: 2px 4px 2px 0;
    }

    /* Lifecycle Timeline */
    .lifecycle-section {
      margin: 16px 0;
    }

    .lifecycle-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .timeline {
      display: flex;
      align-items: flex-start;
      position: relative;
    }

    .timeline-step {
      flex: 1;
      text-align: center;
      position: relative;
    }

    .timeline-step .node {
      width: 28px;
      height: 28px;
      background: var(--samsung-blue);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      margin: 0 auto 6px;
      position: relative;
      z-index: 1;
    }

    .timeline-step:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 14px;
      left: calc(50% + 14px);
      right: calc(-50% + 14px);
      height: 2px;
      background: var(--samsung-blue);
      opacity: 0.3;
    }

    .timeline-step .step-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .timeline-step .step-desc {
      font-size: 9px;
      color: var(--text-secondary);
      margin-top: 2px;
      line-height: 1.3;
    }

    /* CTA */
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

    .skeleton-header { height: 24px; width: 50%; margin: 0 auto 16px; }
    .skeleton-banner { height: 60px; width: 100%; margin-bottom: 16px; border-radius: 8px; }
    .skeleton-grid { height: 180px; width: 100%; margin-bottom: 16px; border-radius: 8px; }
    .skeleton-button { height: 48px; width: 100%; border-radius: 8px; }

    .loading-skeleton { padding: 20px; }

    /* Period Slider */
    .period-section {
      margin-bottom: 16px;
    }

    .period-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .period-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--samsung-blue);
    }

    .period-slider {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: #e5e7eb;
      border-radius: 3px;
      outline: none;
    }

    .period-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--samsung-blue);
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(20,40,160,0.3);
    }

    .period-ticks {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-secondary);
      margin-top: 4px;
      padding: 0 2px;
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
  </style>
</head>
<body>
  <div id="content">
    <div class="card loading-skeleton">
      <div class="skeleton skeleton-header"></div>
      <div class="skeleton skeleton-banner"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="skeleton skeleton-grid"></div>
        <div class="skeleton skeleton-grid"></div>
      </div>
      <div class="skeleton skeleton-button" style="margin-top:16px"></div>
    </div>
  </div>

  <script>
    const content = document.getElementById('content');
    let currentCompData = null;
    let selectedPeriod = null;

    // Restore slider state from saved widget state
    const savedState = window.openai?.widgetState;
    if (savedState?.sliderValue) selectedPeriod = savedState.sliderValue;

    function renderComparison(data) {
      if (!data || !data.comparison) {
        content.innerHTML = '<div class="card"><div class="error-state"><div class="error-icon">😥</div><div class="error-title">비교 데이터를 불러올 수 없습니다</div><div class="error-desc">일시적인 오류가 발생했습니다.<br>잠시 후 다시 시도해 주세요.</div><button class="retry-button" onclick="location.reload()">다시 시도</button></div></div>';
        return;
      }

      currentCompData = data;
      const { comparison, recommendation, lifecycle_stages, included_benefits_value, tradein_info } = data;
      const club = comparison.club || {};
      const outright = comparison.outright || {};

      // Period calculation
      const basePeriod = club.total_months || 12;
      const period = selectedPeriod || basePeriod;
      const monthlyCost = club.monthly_cost || 0;
      const clubTotal = monthlyCost * period;
      const carePlusValue = club.care_plus_value || 0;
      const outrightCarePlusCost = outright.care_plus_cost || carePlusValue || 0;
      const outrightTotal = (outright.device_price || 0) + outrightCarePlusCost - (outright.tradein_credit || 0);
      const currentSavings = outrightTotal - clubTotal;

      // Savings banner
      const savingsHtml = currentSavings > 0 ? \`
        <div class="savings-banner">
          <div class="savings-label">Galaxy Club 선택 시 절약</div>
          <div class="savings-amount">$\${currentSavings}</div>
        </div>
      \` : '';

      // Period slider
      const sliderHtml = \`
        <div class="period-section">
          <div class="period-label">
            <span>사용 기간</span>
            <span class="period-value">\${period}개월</span>
          </div>
          <input type="range" class="period-slider" min="0" max="3" step="1" value="\${[12,18,24,36].indexOf(period) >= 0 ? [12,18,24,36].indexOf(period) : 0}" oninput="changePeriod(this.value)" />
          <div class="period-ticks"><span>12개월</span><span>18개월</span><span>24개월</span><span>36개월</span></div>
        </div>
      \`;

      // Comparison columns
      const comparisonHtml = \`
        <div class="comparison-grid">
          <div class="compare-col club">
            <span class="col-badge">추천</span>
            <div class="col-title">Galaxy Club</div>
            <div class="cost-row"><span>월 비용</span><span class="highlight">$\${monthlyCost}/월</span></div>
            <div class="cost-row"><span>\${period}개월 총액</span><span>$\${clubTotal}</span></div>
            \${club.care_plus_included ? '<div class="cost-row"><span>Care+ 포함</span><span class="positive">$' + carePlusValue + ' 가치</span></div>' : ''}
            \${club.upgrade_included ? '<div class="cost-row"><span>업그레이드</span><span class="positive">포함</span></div>' : ''}
            <div class="cost-row total"><span>실질 비용</span><span class="highlight">$\${clubTotal}</span></div>
          </div>
          <div class="compare-col outright">
            <span class="col-badge">일반 구매</span>
            <div class="col-title">일시불 구매</div>
            <div class="cost-row"><span>기기 가격</span><span>$\${outright.device_price}</span></div>
            \${outright.care_plus_cost ? '<div class="cost-row"><span>Care+ 별도</span><span>+$' + outright.care_plus_cost + '/년</span></div>' : ''}
            \${outright.tradein_credit ? '<div class="cost-row"><span>Trade-in 크레딧</span><span class="positive">-$' + outright.tradein_credit + '</span></div>' : ''}
            <div class="cost-row total"><span>총 비용</span><span>$\${outrightTotal}</span></div>
          </div>
        </div>
      \`;

      // Trade-in info
      let tradeinHtml = '';
      if (tradein_info) {
        tradeinHtml = \`
          <div class="tradein-section">
            <div class="tradein-title">\${tradein_info.device} Trade-in</div>
            <div>예상 보상가: $\${tradein_info.estimated_value} — \${tradein_info.note}</div>
          </div>
        \`;
      }

      // Benefits
      let benefitsHtml = '';
      if (club.included_benefits && club.included_benefits.length > 0) {
        benefitsHtml = \`
          <div class="benefits-section">
            <div class="benefits-title">Galaxy Club 포함 혜택 \${included_benefits_value ? '($' + included_benefits_value + ' 가치)' : ''}</div>
            \${club.included_benefits.map(b => '<span class="benefit-tag">' + b + '</span>').join('')}
          </div>
        \`;
      }

      // Lifecycle
      let lifecycleHtml = '';
      if (lifecycle_stages && lifecycle_stages.length > 0) {
        lifecycleHtml = \`
          <div class="lifecycle-section">
            <div class="lifecycle-title">Galaxy Club 라이프사이클</div>
            <div class="timeline">
              \${lifecycle_stages.map((stage, i) => \`
                <div class="timeline-step">
                  <div class="node">\${i + 1}</div>
                  <div class="step-label">\${stage.label}</div>
                  <div class="step-desc">\${stage.description || ''}</div>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      }

      // Recommendation
      let recHtml = '';
      if (recommendation) {
        recHtml = '<div style="font-size:12px;color:var(--text-secondary);text-align:center;margin-bottom:8px;"><em>' + recommendation + '</em></div>';
      }

      content.innerHTML = \`
        <div class="card">
          <div class="header">
            <h2>비용 비교</h2>
            \${data.device_model ? '<div class="device-name">' + data.device_model + '</div>' : ''}
          </div>
          \${savingsHtml}
          \${sliderHtml}
          \${comparisonHtml}
          \${tradeinHtml}
          \${benefitsHtml}
          \${lifecycleHtml}
          \${recHtml}
          <div class="cta-container">
            <button class="cta-button primary" onclick="enrollClub()">Galaxy Club 가입</button>
            <button class="cta-button secondary" onclick="learnMore()">자세히 알아보기</button>
          </div>
        </div>
      \`;
    }

    const PERIOD_OPTIONS = [12, 18, 24, 36];
    function changePeriod(index) {
      selectedPeriod = PERIOD_OPTIONS[parseInt(index)] || 12;
      window.openai?.setWidgetState?.({ sliderValue: selectedPeriod });
      if (currentCompData) renderComparison(currentCompData);
    }

    function enrollClub() {
      window.parent.postMessage({
        jsonrpc: '2.0',
        method: 'ui/message',
        params: {
          role: 'user',
          content: [{ type: 'text', text: 'Galaxy Club에 가입하고 싶습니다. 가입 절차를 알려주세요.' }]
        }
      }, '*');
    }

    function learnMore() {
      window.parent.postMessage({
        jsonrpc: '2.0',
        method: 'ui/message',
        params: {
          role: 'user',
          content: [{ type: 'text', text: 'Galaxy Club에 대해 더 자세히 알려주세요.' }]
        }
      }, '*');
    }

    window.addEventListener('message', (event) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== '2.0') return;
      if (message.method === 'ui/notifications/tool-result') {
        renderComparison(message.params?.structuredContent);
      }
    }, { passive: true });

    window.addEventListener('openai:set_globals', (event) => {
      const data = event.detail?.globals?.toolOutput || window.openai?.toolOutput;
      if (data) renderComparison(data);
    }, { passive: true });

    if (window.openai?.toolOutput) {
      renderComparison(window.openai.toolOutput);
    }
  </script>
</body>
</html>
  `.trim();
}
