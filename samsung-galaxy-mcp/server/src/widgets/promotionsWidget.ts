export function getPromotionsWidgetHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Samsung Promotions</title>
  <style>
    :root {
      --samsung-blue: #1428a0;
      --samsung-light-blue: #4a90d9;
      --text-primary: #1a1a1a;
      --text-secondary: #666;
      --bg-card: #ffffff;
      --bg-page: #f5f5f5;
      --border-radius: 12px;
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .header h2 {
      font-size: 18px;
      font-weight: 600;
    }

    .filter-btn {
      background: var(--samsung-blue);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
    }

    .promotions-carousel {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 8px;
      -webkit-overflow-scrolling: touch;
    }

    .promotions-carousel::-webkit-scrollbar {
      height: 4px;
    }

    .promotions-carousel::-webkit-scrollbar-thumb {
      background: var(--samsung-blue);
      border-radius: 2px;
    }

    .promo-card {
      flex: 0 0 280px;
      background: var(--bg-card);
      border-radius: var(--border-radius);
      padding: 16px;
      scroll-snap-align: start;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .promo-badge {
      display: inline-block;
      background: var(--samsung-blue);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .promo-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .promo-description {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .promo-discount {
      font-size: 24px;
      font-weight: 700;
      color: var(--samsung-blue);
      margin-bottom: 8px;
    }

    .promo-conditions {
      font-size: 11px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .promo-cta {
      display: block;
      width: 100%;
      background: var(--samsung-blue);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
    }

    .promo-cta:hover {
      background: #0d1f7a;
    }

    .promo-validity {
      font-size: 11px;
      color: var(--text-secondary);
      margin-top: 8px;
      text-align: center;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Available Promotions</h2>
  </div>
  <div id="promotions-container" class="loading">Loading promotions...</div>

  <script>
    const container = document.getElementById('promotions-container');

    function formatDiscount(amount, type) {
      if (type === 'percentage' || type === 'percentage_max') return amount + '% OFF';
      if (type === 'percentage_bonus') return '+' + amount + '% Bonus';
      if (type === 'bundle') return 'FREE $' + amount + ' Value';
      if (type === 'trade_in_max') return 'Up to $' + amount;
      if (type === 'subscription_credit') return '$' + amount + ' Credit';
      if (type === 'free_program') return 'FREE';
      if (type === 'enterprise') return 'Enterprise';
      if (amount === 0) return 'Special Offer';
      return '$' + amount + ' OFF';
    }

    function formatBadge(type) {
      const labels = {
        fixed: 'DISCOUNT', percentage: 'SALE', percentage_max: 'UP TO',
        percentage_bonus: 'BONUS', bundle: 'BUNDLE', trade_in_max: 'TRADE-IN',
        subscription_credit: 'SUBSCRIPTION', free_program: 'FREE', enterprise: 'BUSINESS'
      };
      return labels[type] || type.replace(/_/g, ' ').toUpperCase();
    }

    function renderPromotions(data) {
      const promotions = data?.promotions || [];

      if (promotions.length === 0) {
        container.innerHTML = '<div class="empty-state">No promotions available at this time.</div>';
        return;
      }

      container.className = 'promotions-carousel';
      container.innerHTML = promotions.map(promo => \`
        <div class="promo-card">
          <span class="promo-badge">\${formatBadge(promo.discount_type)}</span>
          <h3 class="promo-title">\${promo.title}</h3>
          <div class="promo-discount">\${formatDiscount(promo.discount_amount, promo.discount_type)}</div>
          <p class="promo-description">\${promo.description}</p>
          \${promo.features ? '<p class="promo-conditions">' + promo.features.slice(0, 3).join(' • ') + '</p>' : ''}
          \${promo.bundle_options ? '<p class="promo-conditions">' + promo.bundle_options[0] + '</p>' : ''}
          <p class="promo-conditions">\${promo.conditions?.join(' • ') || ''}</p>
          <button class="promo-cta" onclick="handleCTA('\${promo.id}')">\${promo.cta_text || 'Learn More'}</button>
          <p class="promo-validity">Valid until \${new Date(promo.valid_until).toLocaleDateString()}</p>
        </div>
      \`).join('');
    }

    function handleCTA(promoId) {
      // Send follow-up message to ChatGPT
      window.parent.postMessage({
        jsonrpc: '2.0',
        method: 'ui/message',
        params: {
          role: 'user',
          content: [{ type: 'text', text: 'Tell me more about this promotion: ' + promoId }]
        }
      }, '*');
    }

    // Listen for tool results from MCP host
    window.addEventListener('message', (event) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== '2.0') return;

      if (message.method === 'ui/notifications/tool-result') {
        renderPromotions(message.params?.structuredContent);
      }
    }, { passive: true });

    // Listen for ChatGPT set_globals event
    window.addEventListener('openai:set_globals', (event) => {
      const data = event.detail?.globals?.toolOutput || window.openai?.toolOutput;
      if (data) renderPromotions(data);
    }, { passive: true });

    // Initial render if toolOutput is available (ChatGPT extension)
    // Note: toolOutput IS the structuredContent directly
    if (window.openai?.toolOutput) {
      renderPromotions(window.openai.toolOutput);
    }
  </script>
</body>
</html>
  `.trim();
}
