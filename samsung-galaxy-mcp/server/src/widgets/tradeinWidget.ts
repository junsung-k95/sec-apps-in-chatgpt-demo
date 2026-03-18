export function getTradeinWidgetHtml(): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>보상판매 견적</title>
  <style>
    :root {
      --samsung-blue: #1428a0;
      --samsung-blue-light: #eef2ff;
      --success-green: #22c55e;
      --success-green-light: #dcfce7;
      --warning-orange: #f59e0b;
      --warning-orange-light: #fef3c7;
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
        --samsung-blue-light: #1e2a5a;
        --success-green-light: #1a3a2a;
        --warning-orange-light: #3a2a1a;
      }
      body { color-scheme: dark; }
      .chip { background: #3d3d3d; border-color: #555; color: #e5e5e5; }
      .chip:hover { background: #1e2a5a; }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

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

    /* ===== Skeleton Loading ===== */
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

    .skeleton-header { height: 24px; width: 60%; margin-bottom: 16px; }
    .skeleton-device { height: 60px; width: 100%; margin-bottom: 16px; }
    .skeleton-options { height: 40px; width: 100%; margin-bottom: 12px; }
    .skeleton-price { height: 56px; width: 50%; margin: 16px auto; }
    .skeleton-button { height: 48px; width: 100%; margin-top: 16px; }

    .loading-skeleton {
      padding: 20px;
    }

    /* ===== Header ===== */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .header h2 { font-size: 18px; font-weight: 600; }

    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.processing { background: #dbeafe; color: #1e40af; }
    .status-badge.completed { background: #dcfce7; color: #166534; }

    /* ===== Device Info ===== */
    .device-info {
      background: var(--bg-page);
      padding: 14px 16px;
      border-radius: 10px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .device-icon {
      width: 48px; height: 48px;
      background: var(--samsung-blue-light);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .device-info .model { font-size: 16px; font-weight: 600; }
    .device-info .details { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

    /* ===== Option Selectors ===== */
    .option-section {
      margin-bottom: 16px;
    }

    .option-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .option-label .icon { font-size: 14px; }

    .option-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .chip {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 2px solid #e5e7eb;
      background: white;
      color: var(--text-primary);
      transition: all 0.2s ease;
    }

    .chip:hover { border-color: var(--samsung-blue); background: var(--samsung-blue-light); }
    .chip.selected {
      border-color: var(--samsung-blue);
      background: var(--samsung-blue);
      color: white;
    }

    .chip-small {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* Condition chips with colors */
    .chip.condition-excellent.selected { background: var(--success-green); border-color: var(--success-green); }
    .chip.condition-good.selected { background: #4ade80; border-color: #4ade80; }
    .chip.condition-fair.selected { background: var(--warning-orange); border-color: var(--warning-orange); }
    .chip.condition-poor.selected { background: var(--danger-red); border-color: var(--danger-red); }

    /* Select dropdown */
    .option-select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      font-size: 13px;
      font-family: inherit;
      background: white;
      color: var(--text-primary);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23666'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      transition: border-color 0.2s;
    }

    .option-select:focus { outline: none; border-color: var(--samsung-blue); }

    /* ===== Price Display ===== */
    .price-section {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
      margin: 16px 0;
    }

    .price-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .price-amount {
      font-size: 42px;
      font-weight: 700;
      color: var(--success-green);
      margin: 8px 0;
      animation: countUp 0.4s ease-out;
    }

    .price-local {
      font-size: 16px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .price-validity {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    /* Condition range bar */
    .condition-range {
      display: flex;
      gap: 4px;
      margin-top: 12px;
      padding: 0 20px;
    }

    .range-item {
      flex: 1;
      text-align: center;
    }

    .range-bar {
      height: 4px;
      border-radius: 2px;
      margin-bottom: 4px;
    }

    .range-item .range-label { font-size: 9px; color: var(--text-secondary); }
    .range-item .range-value { font-size: 11px; font-weight: 600; color: var(--text-secondary); }
    .range-item.active .range-value { color: var(--text-primary); font-weight: 700; }
    .range-item.active .range-bar { box-shadow: 0 0 0 2px rgba(34,197,94,0.3); }

    .range-bar.excellent { background: var(--success-green); }
    .range-bar.good { background: #4ade80; }
    .range-bar.fair { background: var(--warning-orange); }
    .range-bar.poor { background: var(--danger-red); }

    /* ===== Before/After ===== */
    .before-after {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 8px;
      align-items: center;
      margin: 16px 0;
      padding: 16px;
      background: var(--bg-page);
      border-radius: 10px;
    }

    .ba-col { text-align: center; }
    .ba-col .ba-label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px; }
    .ba-col .ba-value { font-size: 24px; font-weight: 700; }
    .ba-col .ba-value.before { color: var(--text-secondary); text-decoration: line-through; }
    .ba-col .ba-value.after { color: var(--success-green); }

    @keyframes arrowPulse {
      0%, 100% { transform: translateX(0); opacity: 0.7; }
      50% { transform: translateX(4px); opacity: 1; }
    }

    .ba-arrow { font-size: 20px; color: var(--samsung-blue); animation: arrowPulse 1.5s infinite; }

    .ba-diff {
      text-align: center;
      margin-top: 8px;
      font-size: 13px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 12px;
      display: inline-block;
    }

    .ba-diff.positive { color: #166534; background: #dcfce7; }
    .ba-diff.negative { color: #991b1b; background: #fee2e2; }

    /* ===== Vision Condition Indicators ===== */
    .condition-grid {
      display: flex;
      gap: 8px;
      margin: 12px 0;
    }

    .condition-item {
      flex: 1;
      text-align: center;
      padding: 12px 6px;
      background: var(--bg-page);
      border-radius: 10px;
      transition: transform 0.2s;
    }

    @keyframes popIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .condition-item { animation: popIn 0.3s ease-out backwards; }
    .condition-item:nth-child(1) { animation-delay: 0.1s; }
    .condition-item:nth-child(2) { animation-delay: 0.2s; }
    .condition-item:nth-child(3) { animation-delay: 0.3s; }

    .condition-item .ci-icon { font-size: 28px; margin-bottom: 4px; }
    .condition-item .ci-label { font-size: 10px; color: var(--text-secondary); }
    .condition-item .ci-value { font-size: 12px; font-weight: 600; margin-top: 2px; }
    .ci-value.excellent, .ci-value.good { color: var(--success-green); }
    .ci-value.fair { color: var(--warning-orange); }
    .ci-value.poor { color: var(--danger-red); }

    /* ===== Breakdown ===== */
    .breakdown { margin: 16px 0; }
    .breakdown-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px solid #f0f0f0;
    }

    .breakdown-row:last-child { border-bottom: none; font-weight: 600; }
    .breakdown-row .positive { color: var(--success-green); }
    .breakdown-row .negative { color: #ef4444; }

    /* ===== Next Steps ===== */
    .next-steps { margin: 16px 0; }
    .next-steps-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 8px 0;
    }

    .step-number {
      width: 24px; height: 24px;
      background: var(--samsung-blue);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
      flex-shrink: 0;
    }

    .step-text { font-size: 13px; line-height: 1.4; }

    /* ===== CTA Buttons ===== */
    .cta-container {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .cta-button {
      flex: 1;
      padding: 14px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      border: none;
      transition: all 0.2s ease;
    }

    .cta-button.primary {
      background: var(--samsung-blue);
      color: white;
    }

    .cta-button.primary:hover { background: #0d1f7a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(20,40,160,0.3); }
    .cta-button.primary:active { transform: translateY(0); }

    .cta-button.secondary {
      background: white;
      color: var(--samsung-blue);
      border: 2px solid var(--samsung-blue);
      font-size: 13px;
    }

    .cta-button.secondary:hover { background: var(--samsung-blue-light); }

    /* ===== Promo Banner ===== */
    .promo-banner {
      background: linear-gradient(135deg, #1428a0 0%, #4a90d9 100%);
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 12px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .promo-banner .promo-icon { font-size: 16px; }
    .promo-banner .promo-amount { font-weight: 700; }

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

    /* ===== Confirm Panel ===== */
    .confirm-overlay {
      margin-top: 16px;
      padding: 16px;
      background: #fef3c7;
      border-radius: 10px;
      text-align: center;
    }

    .confirm-overlay .confirm-text {
      font-size: 14px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 12px;
    }

    .confirm-overlay .confirm-buttons {
      display: flex;
      gap: 8px;
    }

    .confirm-overlay .confirm-buttons button {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .confirm-overlay .btn-confirm {
      background: var(--success-green);
      color: white;
    }

    .confirm-overlay .btn-cancel {
      background: white;
      color: var(--text-secondary);
      border: 2px solid #e5e7eb;
    }

    /* ===== Search Input ===== */
    .search-section {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .search-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      font-size: 13px;
      font-family: inherit;
      background: white;
      transition: border-color 0.2s;
    }

    .search-input:focus { outline: none; border-color: var(--samsung-blue); }

    .search-button {
      padding: 10px 18px;
      border-radius: 10px;
      background: var(--samsung-blue);
      color: white;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .search-button:hover { background: #0d1f7a; }
    .search-button:disabled { background: #9ca3af; cursor: not-allowed; }

    /* ===== Price Range ===== */
    .price-range-section {
      text-align: center;
      padding: 20px 16px;
      margin: 16px 0;
      background: var(--success-green-light);
      border-radius: 10px;
    }

    .price-range-label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .price-range-values {
      font-size: 32px;
      font-weight: 700;
      color: var(--success-green);
      animation: countUp 0.4s ease-out;
    }

    .price-range-sep {
      font-size: 24px;
      color: var(--text-secondary);
      margin: 0 4px;
    }

    /* ===== Disclaimer ===== */
    .disclaimer {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 14px;
      margin: 12px 0;
      background: var(--warning-orange-light);
      border-radius: 8px;
      font-size: 12px;
      color: #92400e;
      line-height: 1.5;
    }

    .disclaimer-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

    .search-loading {
      text-align: center;
      padding: 20px;
      color: var(--text-secondary);
      font-size: 13px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .spinner {
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid #e5e7eb;
      border-top-color: var(--samsung-blue);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div id="content">
    <div class="card loading-skeleton">
      <div class="skeleton skeleton-header"></div>
      <div class="skeleton skeleton-device"></div>
      <div class="skeleton skeleton-options"></div>
      <div class="skeleton skeleton-options"></div>
      <div class="skeleton skeleton-price"></div>
      <div class="skeleton skeleton-button"></div>
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
          appInfo: { name: 'tradein-widget', version: '1.0.0' },
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
    let currentData = null;
    let selectedStorage = null;
    let selectedCondition = 'excellent';
    let searchMode = false;

    // Restore state from saved widget state
    const savedState = window.openai?.widgetState;
    if (savedState?.selectedStorage) selectedStorage = savedState.selectedStorage;
    if (savedState?.selectedCondition) selectedCondition = savedState.selectedCondition;

    function getStatusClass(status) {
      if (status === 'completed') return 'completed';
      if (status === 'processing') return 'processing';
      return 'pending';
    }

    function getStatusText(status) {
      if (status === 'completed') return '완료';
      if (status === 'processing') return '처리 중';
      return '사진 대기 중';
    }

    function getGrade(condition) {
      const grades = { no_scratches: 'excellent', light_scratches: 'good', visible_scratches: 'fair', cracked: 'poor', pristine: 'excellent', minor_wear: 'good', dents_scratches: 'fair', major_damage: 'poor', clear: 'excellent', minor_smudge: 'good', scratched: 'fair' };
      return grades[condition] || 'fair';
    }

    function getGradeIcon(grade) {
      if (grade === 'excellent' || grade === 'good') return '🟢';
      if (grade === 'fair') return '🟡';
      return '🔴';
    }

    function getDeviceIcon(category) {
      const icons = { smartphone: '📱', tablet: '📱', watch: '⌚', earbuds: '🎧', notebook: '💻', wearable: '💍' };
      return icons[category] || '📱';
    }

    function getConditionLabel(cond) {
      const labels = { excellent: '최상', good: '양호', fair: '보통', poor: '불량' };
      return labels[cond] || cond;
    }

    function formatPrice(value) {
      return value.toLocaleString();
    }

    function fmtP(usdValue) {
      const ci = currentData?.currency_info;
      if (!ci || ci.region_code === 'US' || !ci.base_rate) return '$' + formatPrice(usdValue);
      const local = Math.round(usdValue * ci.base_rate);
      if (ci.region_code === 'KR') return formatPrice(local) + '원';
      return ci.symbol + formatPrice(local);
    }

    // ===== Search Results View (Interactive Form) =====
    function renderSearchResults(data) {
      currentData = data;
      const results = data.results || [];
      if (results.length === 0) {
        content.innerHTML = '<div class="card"><div class="error-state"><div class="error-icon">😥</div><div class="error-title">기기를 찾을 수 없습니다</div><div class="error-desc">입력한 모델명을 확인해 주세요.<br>예: Galaxy S24, Galaxy Z Fold6</div><button class="retry-button" onclick="showSearchMode()">다시 검색하기</button></div></div>';
        return;
      }

      const device = results[0];
      const valuations = device.valuations || [];
      if (!selectedStorage && valuations.length > 0) {
        selectedStorage = valuations[0].storage;
      }

      const currentVal = valuations.find(v => v.storage === selectedStorage) || valuations[0];
      const condRange = currentVal.condition_range || {};
      const currentPrice = condRange[selectedCondition] || currentVal.with_promo || currentVal.base_value;

      // Storage chips
      const storageChips = valuations.map(v =>
        '<button class="chip ' + (v.storage === selectedStorage ? 'selected' : '') + '" onclick="selectStorage(\\'' + v.storage + '\\')">' + v.storage + '</button>'
      ).join('');

      // Condition chips
      const condChips = ['excellent', 'good', 'fair', 'poor'].map(c =>
        '<button class="chip chip-small condition-' + c + ' ' + (c === selectedCondition ? 'selected' : '') + '" onclick="selectCondition(\\'' + c + '\\')">' + getConditionLabel(c) + '</button>'
      ).join('');

      // Condition range bar
      const rangeHtml = ['excellent', 'good', 'fair', 'poor'].map(c => {
        const val = condRange[c] || 0;
        return '<div class="range-item ' + (c === selectedCondition ? 'active' : '') + '"><div class="range-bar ' + c + '"></div><div class="range-label">' + getConditionLabel(c) + '</div><div class="range-value">' + fmtP(val) + '</div></div>';
      }).join('');

      // Promo banner
      const promoHtml = data.promotional_bonus ? '<div class="promo-banner"><span class="promo-icon">🎁</span><span>현재 <span class="promo-amount">+' + fmtP(data.promotional_bonus.amount) + '</span> ' + data.promotional_bonus.description + ' 적용 중 (~' + data.promotional_bonus.valid_until + ')</span></div>' : '';

      content.innerHTML =
        '<div class="card">' +
          '<div class="header"><h2>보상판매 견적</h2></div>' +
          '<div class="search-section">' +
            '<input id="search-input" class="search-input" type="text" placeholder="다른 기기 검색..." value="' + (device.model || '') + '" onkeydown="handleSearchKeydown(event)" />' +
            '<button class="search-button" onclick="searchDevice()">검색</button>' +
          '</div>' +
          promoHtml +
          '<div class="device-info">' +
            '<div class="device-icon">' + getDeviceIcon(device.category) + '</div>' +
            '<div><div class="model">' + device.model + '</div>' +
            '<div class="details">' + (device.release_year || '') + ' • ' + (device.category || '') + '</div></div>' +
          '</div>' +
          '<div class="option-section">' +
            '<div class="option-label"><span class="icon">💾</span>저장 용량</div>' +
            '<div class="option-chips">' + storageChips + '</div>' +
          '</div>' +
          '<div class="option-section">' +
            '<div class="option-label"><span class="icon">📊</span>기기 상태</div>' +
            '<div class="option-chips">' + condChips + '</div>' +
          '</div>' +
          '<div class="price-section">' +
            '<div class="price-label">예상 보상판매 가격</div>' +
            '<div class="price-amount" key="' + currentPrice + '">' + fmtP(currentPrice) + '</div>' +
          '</div>' +
          '<div class="condition-range">' + rangeHtml + '</div>' +
          '<div class="cta-container">' +
            '<button class="cta-button primary" onclick="submitAppraisal()">정식 견적 받기</button>' +
          '</div>' +
        '</div>';
    }

    function selectStorage(storage) {
      selectedStorage = storage;
      window.openai?.setWidgetState?.({ selectedStorage: storage, selectedCondition, searchQuery: document.getElementById('search-input')?.value });
      renderSearchResults(currentData);
    }

    function selectCondition(condition) {
      selectedCondition = condition;
      window.openai?.setWidgetState?.({ selectedStorage, selectedCondition: condition, searchQuery: document.getElementById('search-input')?.value });
      renderSearchResults(currentData);
    }

    function submitAppraisal() {
      const results = currentData?.results || [];
      const device = results[0];
      if (!device) return;

      const condLabel = getConditionLabel(selectedCondition);
      const msg = device.model + ' ' + selectedStorage + ', ' + condLabel + ' 상태로 보상판매 견적을 받고 싶습니다.';

      window.parent.postMessage({
        jsonrpc: '2.0',
        method: 'ui/message',
        params: { role: 'user', content: [{ type: 'text', text: msg }] }
      }, '*');
    }

    // ===== Appraisal View =====
    function renderAppraisal(data) {
      currentData = data;

      if (data.error) {
        content.innerHTML =
          '<div class="card"><div class="error-state">' +
            '<div class="error-icon">😥</div>' +
            '<div class="error-title">' + (data.error === 'device_not_found' ? '기기를 찾을 수 없습니다' : '견적 정보를 불러올 수 없습니다') + '</div>' +
            '<div class="error-desc">' + (data.error === 'device_not_found' ? '입력한 모델명을 확인해 주세요.<br>예: Galaxy S24, Galaxy Z Fold6' : '일시적인 오류가 발생했습니다.<br>잠시 후 다시 시도해 주세요.') + '</div>' +
            '<button class="retry-button" onclick="showSearchMode()">다시 검색하기</button>' +
          '</div></div>';
        return;
      }

      const valuation = data.valuation || {};
      const breakdown = valuation.breakdown || {};
      const status = data.status || 'initial_estimate';
      const device = data.device || {};

      // Before/After — show price range if available
      let beforeAfterHtml = '';
      if (data.vision_analysis_result) {
        const va = data.vision_analysis_result;
        if (va.price_range) {
          beforeAfterHtml =
            '<div class="price-range-section">' +
              '<div class="price-range-label">사진 기반 예상 보상가 범위</div>' +
              '<div class="price-range-values">' +
                '<span class="price-range-low">' + fmtP(va.price_range.low) + '</span>' +
                '<span class="price-range-sep"> ~ </span>' +
                '<span class="price-range-high">' + fmtP(va.price_range.high) + '</span>' +
              '</div>' +
            '</div>';
        } else {
          const diff = va.new_value - va.original_value;
          const diffSign = diff >= 0 ? '+' : '';
          beforeAfterHtml =
            '<div class="before-after">' +
              '<div class="ba-col"><div class="ba-label">기존 견적</div><div class="ba-value before">' + fmtP(va.original_value) + '</div></div>' +
              '<div class="ba-arrow">→</div>' +
              '<div class="ba-col"><div class="ba-label">사진 기반 견적</div><div class="ba-value after">' + fmtP(va.new_value) + '</div></div>' +
            '</div>' +
            '<div style="text-align:center"><span class="ba-diff ' + (diff >= 0 ? 'positive' : 'negative') + '">' + diffSign + fmtP(Math.abs(diff)) + ' ' + (diff >= 0 ? '상향 조정' : '하향 조정') + '</span></div>';
        }
      }

      // Disclaimer
      let disclaimerHtml = '';
      if (data.disclaimer) {
        disclaimerHtml = '<div class="disclaimer"><span class="disclaimer-icon">⚠️</span><span>' + data.disclaimer + '</span></div>';
      }

      // Vision conditions
      let conditionHtml = '';
      if (data.vision_conditions) {
        const vc = data.vision_conditions;
        conditionHtml = '<div class="condition-grid">';
        ['screen_condition', 'body_condition', 'camera_condition'].forEach(key => {
          if (vc[key]) {
            const grade = getGrade(vc[key]);
            const labels = { screen_condition: '화면', body_condition: '외관', camera_condition: '카메라' };
            conditionHtml += '<div class="condition-item"><div class="ci-icon">' + getGradeIcon(grade) + '</div><div class="ci-label">' + labels[key] + '</div><div class="ci-value ' + grade + '">' + getConditionLabel(grade) + '</div></div>';
          }
        });
        conditionHtml += '</div>';
      }

      // Breakdown
      let breakdownHtml = '';
      if (breakdown.base) {
        breakdownHtml =
          '<div class="breakdown"><div class="breakdown-title">가격 상세</div>' +
          '<div class="breakdown-row"><span>기본 가격</span><span>' + breakdown.base + '</span></div>' +
          '<div class="breakdown-row"><span>상태 조정</span><span class="' + (valuation.condition_adjustment >= 0 ? 'positive' : 'negative') + '">' + breakdown.condition + '</span></div>' +
          (breakdown.issues && valuation.issues_deduction !== 0 ? '<div class="breakdown-row"><span>이슈 차감</span><span class="negative">' + breakdown.issues + '</span></div>' : '') +
          (breakdown.bonus ? '<div class="breakdown-row"><span>프로모션 보너스</span><span class="positive">' + breakdown.bonus + '</span></div>' : '') +
          '<div class="breakdown-row"><span>최종 가격</span><span>' + breakdown.total + '</span></div></div>';
      }

      // Next steps
      let nextStepsHtml = '';
      if (data.next_steps) {
        nextStepsHtml = '<div class="next-steps"><div class="next-steps-title">다음 단계</div>' +
          data.next_steps.map((step, i) => '<div class="step"><span class="step-number">' + (i + 1) + '</span><span class="step-text">' + step + '</span></div>').join('') +
          '</div>';
      }

      content.innerHTML =
        '<div class="card">' +
          '<div class="header"><h2>보상판매 견적</h2><span class="status-badge ' + getStatusClass(status) + '">' + getStatusText(status) + '</span></div>' +
          '<div class="device-info"><div class="device-icon">' + getDeviceIcon('smartphone') + '</div><div><div class="model">' + (device.model || '알 수 없는 기기') + '</div><div class="details">' + (device.storage || '') + ' • ' + (data.condition ? getConditionLabel(data.condition) : '') + ' 상태</div></div></div>' +
          beforeAfterHtml +
          conditionHtml +
          disclaimerHtml +
          '<div class="price-section"><div class="price-label">예상 보상판매 가격</div><div class="price-amount">' + fmtP(valuation.final_value || 0) + '</div><div class="price-validity">유효기간: ' + (data.valid_until ? new Date(data.valid_until).toLocaleDateString('ko-KR') : '없음') + '</div></div>' +
          breakdownHtml +
          nextStepsHtml +
          '<div class="cta-container">' +
            '<button class="cta-button primary" onclick="handleCTA()">' + (data.cta?.text || '견적 수락하기') + '</button>' +
            (data.vision_analysis_result || status === 'completed' ? '<button class="cta-button secondary" onclick="crossSellClub()">Galaxy Club에 적용</button>' : '') +
          '</div>' +
        '</div>';
    }

    function handleCTA() {
      const appraisalId = currentData?.appraisal_id;
      if (!appraisalId) return;

      const finalValue = currentData?.valuation?.final_value || currentData?.vision_analysis_result?.new_value || 0;
      const ctaContainer = document.querySelector('.cta-container');
      if (ctaContainer) {
        ctaContainer.innerHTML =
          '<div class="confirm-overlay">' +
            '<div class="confirm-text">' + fmtP(finalValue) + '에 수락하시겠습니까?</div>' +
            '<div class="confirm-buttons">' +
              '<button class="btn-cancel" onclick="cancelAccept()">취소</button>' +
              '<button class="btn-confirm" onclick="confirmAccept()">수락</button>' +
            '</div>' +
          '</div>';
      }
    }

    function confirmAccept() {
      const appraisalId = currentData?.appraisal_id;
      window.parent.postMessage({
        jsonrpc: '2.0', method: 'ui/message',
        params: { role: 'user', content: [{ type: 'text', text: '견적 ' + appraisalId + '의 보상판매 제안을 수락하겠습니다. Trade-in 페이지: https://www.samsung.com/sec/trade-in/' }] }
      }, '*');
    }

    function cancelAccept() {
      if (currentData) renderAppraisal(currentData);
    }

    function crossSellClub() {
      window.parent.postMessage({
        jsonrpc: '2.0', method: 'ui/message',
        params: { role: 'user', content: [{ type: 'text', text: 'Galaxy Club에 대해 알려주세요. Trade-in 대신 Galaxy Club으로 가입하고 싶습니다.' }] }
      }, '*');
    }

    // ===== Search via tools/call =====
    async function searchDevice() {
      const input = document.getElementById('search-input');
      if (!input || !input.value.trim()) return;

      const query = input.value.trim();
      const resultArea = document.getElementById('search-result-area');
      if (resultArea) {
        resultArea.innerHTML = '<div class="search-loading"><span class="spinner"></span>검색 중...</div>';
      }

      try {
        await bridgeReady;
        const response = await rpcRequest('tools/call', {
          name: 'search_tradein_value',
          arguments: { query: query, region: 'KR', carrier: 'unlocked' }
        });
        if (response?.structuredContent) {
          handleData(response.structuredContent);
        }
      } catch (e) {
        // Fallback to ui/message
        window.parent.postMessage({
          jsonrpc: '2.0', method: 'ui/message',
          params: { role: 'user', content: [{ type: 'text', text: query + ' 보상판매 가격을 알려주세요.' }] }
        }, '*');
      }
    }

    function handleSearchKeydown(e) {
      if (e.key === 'Enter') searchDevice();
    }

    function showSearchMode() {
      searchMode = true;
      content.innerHTML =
        '<div class="card">' +
          '<div class="header"><h2>보상판매 견적</h2></div>' +
          '<div class="search-section">' +
            '<input id="search-input" class="search-input" type="text" placeholder="기기 모델명 검색 (예: Galaxy S24)" onkeydown="handleSearchKeydown(event)" />' +
            '<button class="search-button" onclick="searchDevice()">검색</button>' +
          '</div>' +
          '<div id="search-result-area" style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">기기 모델명을 입력하면 예상 보상판매 가격을 조회합니다.</div>' +
        '</div>';
      setTimeout(() => { const el = document.getElementById('search-input'); if (el) el.focus(); }, 100);
    }

    // ===== Router: detect data type and render =====
    function handleData(data) {
      if (!data) return;
      if (data.results) {
        renderSearchResults(data);
      } else {
        renderAppraisal(data);
      }
    }

    // Listen for messages (RPC responses + notifications)
    window.addEventListener('message', (event) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== '2.0') return;

      // Handle RPC responses (for tools/call, ui/initialize)
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
        handleData(message.params?.structuredContent);
      }
    }, { passive: true });

    window.addEventListener('openai:set_globals', (event) => {
      const data = event.detail?.globals?.toolOutput || window.openai?.toolOutput;
      if (data) handleData(data);
    }, { passive: true });

    if (window.openai?.toolOutput) {
      handleData(window.openai.toolOutput);
    }
  </script>
</body>
</html>
  `.trim();
}
