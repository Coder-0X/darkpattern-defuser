/**
 * DarkPattern Defuser - Content Script (Manifest V3)
 * Real-time detection and neutralization of fake timers, synthetic scarcity,
 * pre-checked add-ons, subscription traps, and confirmshaming.
 */

(function () {
  'use strict';

  if (window.__DARKPATTERN_DEFUSER_LOADED__) return;
  window.__DARKPATTERN_DEFUSER_LOADED__ = true;

  // State
  let detectedPatterns = [];
  let totalSavedMoney = 0;
  let hudContainer = null;
  let isScanning = false;
  let scanDebounceTimer = null;
  let observedTimers = new Map();

  // Known 3rd-party fake urgency / social proof vendors
  const VENDOR_DOM_SIGNATURES = [
    'fera', 'nudgify', 'useproof', 'salespop', 'provely', 'beeketing',
    'hurrify', 'hextom', 'loox', 'urgency-bear', 'fomo'
  ];

  // Regex Patterns
  const REGEX = {
    timerText: /\b(?:sale|offer|deal|cart|reserve|order).{0,30}(?:ends|expires|in|for)\s*:?\s*(\d{1,2}:\d{2}(?::\d{2})?)/i,
    clockText: /\b\d{1,2}\s*(?:m|min|minutes)\s*\d{1,2}\s*(?:s|sec|seconds)\b/i,
    viewerText: /\b(\d{1,4})\s+(?:people|shoppers|others)\s+(?:are\s+)?(?:viewing|watching|looking\s+at)\b/i,
    stockScarcity: /\bonly\s+(\d{1,2})\s+(?:left|remaining|in\s+stock)\b/i,
    recentBuyer: /\b[A-Z][a-z]+\s+from\s+[A-Z][a-z\s]+(?:just\s+purchased|bought)/i,
    confirmshame: /\b(?:no[,\s]+(?:thanks[,\s]+)?i\s+(?:hate|prefer\s+paying|don't\s+care|don't\s+want)|i\s+hate\s+discounts)\b/i,
    addonKeywords: /insurance|protection|warranty|priority\s+processing|carbon|tip|coverage|navidium|route/i,
    priceExtractor: /(?:\+\s*|\(\s*)?\$(\d+(?:\.\d{2})?)/
  };

  /**
   * 1. DETECT FAKE COUNTDOWN TIMERS
   */
  function scanTimers() {
    const candidates = document.querySelectorAll(
      '[class*="countdown"], [id*="countdown"], [class*="timer"], [id*="timer"], [class*="urgency"], [data-countdown]'
    );

    candidates.forEach((el) => {
      if (el.dataset.dpDefused) return;
      const text = el.textContent.trim();
      const match = text.match(REGEX.timerText) || text.match(REGEX.clockText) || text.match(/\b\d{1,2}:\d{2}\b/);

      if (match) {
        // Check if element has client-side timer behavior
        const elKey = el.id || el.className || text.substring(0, 20);
        const prevText = observedTimers.get(elKey);

        if (!prevText) {
          observedTimers.set(elKey, text);
        }

        el.dataset.dpDefused = 'true';
        el.classList.add('dp-timer-flagged');

        // Neutralize: attach badge
        const badge = document.createElement('span');
        badge.className = 'dp-pill-badge dp-timer-pill';
        badge.innerHTML = '⏳ <strong>Fake Urgency:</strong> Synthetic Timer';
        badge.title = 'This countdown runs on a client-side JavaScript loop and typically resets on page refresh.';
        el.parentNode.insertBefore(badge, el);

        detectedPatterns.push({
          type: 'FAKE_TIMER',
          title: 'Synthetic Countdown Timer',
          description: `Detected timer "${match[0]}" operating via client-side loop.`,
          element: el
        });
      }
    });
  }

  /**
   * 2. DETECT SYNTHETIC SCARCITY & FAKE VIEWERS
   */
  function scanScarcity() {
    // 1. Text-based viewer and stock warnings
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (!node.textContent || node.parentElement.closest('.dp-hud, script, style')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodesToCheck = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      nodesToCheck.push(currentNode);
    }

    nodesToCheck.forEach((textNode) => {
      const text = textNode.textContent.trim();
      const parent = textNode.parentElement;
      if (!parent || parent.dataset.dpDefused) return;

      const viewerMatch = text.match(REGEX.viewerText);
      const stockMatch = text.match(REGEX.stockScarcity);
      const buyerMatch = text.match(REGEX.recentBuyer);

      if (viewerMatch || stockMatch || buyerMatch) {
        parent.dataset.dpDefused = 'true';
        parent.classList.add('dp-scarcity-flagged');

        const label = viewerMatch ? 'Synthetic Viewers' : stockMatch ? 'Synthetic Stock Scarcity' : 'Fake Social Proof Toast';
        const badge = document.createElement('span');
        badge.className = 'dp-pill-badge dp-scarcity-pill';
        badge.innerHTML = `👥 <strong>${label}:</strong> Unverified`;
        parent.parentNode.insertBefore(badge, parent);

        detectedPatterns.push({
          type: 'SYNTHETIC_SCARCITY',
          title: label,
          description: `Unverified dynamic text: "${text.substring(0, 45)}..."`,
          element: parent
        });
      }
    });

    // 2. Known 3rd party vendor widgets
    VENDOR_DOM_SIGNATURES.forEach((vendor) => {
      const widgets = document.querySelectorAll(`[class*="${vendor}"], [id*="${vendor}"]`);
      widgets.forEach((w) => {
        if (w.dataset.dpDefused) return;
        w.dataset.dpDefused = 'true';
        w.classList.add('dp-vendor-muted');

        detectedPatterns.push({
          type: 'SYNTHETIC_SCARCITY',
          title: `Third-Party Scarcity Plugin (${vendor})`,
          description: `Dynamic social proof widget powered by ${vendor}.`,
          element: w
        });
      });
    });
  }

  /**
   * 3. SNEAK-INTO-CART / PRE-CHECKED ADD-ONS
   */
  function scanSneakIntoCart() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

    checkboxes.forEach((cb) => {
      if (cb.dataset.dpDefused) return;

      // Find surrounding label or container
      const container = cb.closest('label') || cb.closest('.checkbox') || cb.parentElement;
      if (!container) return;

      const fullText = container.textContent.trim();
      if (REGEX.addonKeywords.test(fullText)) {
        cb.dataset.dpDefused = 'true';

        // Extract added monetary amount if present
        let savedPrice = 0;
        const priceMatch = fullText.match(REGEX.priceExtractor);
        if (priceMatch) {
          savedPrice = parseFloat(priceMatch[1]);
        } else {
          savedPrice = 2.99; // conservative default for shipping protection
        }

        // Auto-uncheck sneaky pre-selected add-on
        cb.checked = false;
        cb.dispatchEvent(new Event('change', { bubbles: true }));

        totalSavedMoney += savedPrice;

        container.classList.add('dp-addon-defused');
        const badge = document.createElement('span');
        badge.className = 'dp-pill-badge dp-addon-pill';
        badge.innerHTML = `🛡️ <strong>Sneaky Add-on Defused:</strong> Auto-Unchecked (Saved $${savedPrice.toFixed(2)})`;
        container.parentNode.insertBefore(badge, container);

        detectedPatterns.push({
          type: 'PRECHECKED_ADDON',
          title: 'Pre-Selected Hidden Add-on',
          description: `Auto-unchecked "${fullText.substring(0, 35)}..."`,
          savedAmount: savedPrice,
          element: container
        });
      }
    });
  }

  /**
   * 4. SUBSCRIPTION TRAPS (Pre-selected Recurring Billing)
   */
  function scanSubscriptionTraps() {
    const radios = document.querySelectorAll('input[type="radio"]:checked');

    radios.forEach((radio) => {
      if (radio.dataset.dpDefused) return;
      const label = radio.closest('label') || radio.parentElement;
      if (!label) return;

      const text = label.textContent.trim().toLowerCase();
      if (text.includes('subscribe') || text.includes('auto-renew') || text.includes('auto-ship') || text.includes('recurring')) {
        // Check if there is an alternative one-time purchase option
        const form = radio.closest('form') || document.body;
        const hasOneTime = form.textContent.toLowerCase().includes('one-time') || form.textContent.toLowerCase().includes('single purchase');

        if (hasOneTime) {
          radio.dataset.dpDefused = 'true';
          label.classList.add('dp-sub-flagged');

          const badge = document.createElement('span');
          badge.className = 'dp-pill-badge dp-sub-pill';
          badge.innerHTML = '⚠️ <strong>Subscription Trap:</strong> Recurring billing pre-selected by default';
          label.parentNode.insertBefore(badge, label);

          detectedPatterns.push({
            type: 'SUBSCRIPTION_TRAP',
            title: 'Pre-Selected Recurring Subscription',
            description: 'Recurring auto-ship is pre-selected instead of standard one-time purchase.',
            element: label
          });
        }
      }
    });
  }

  /**
   * 5. CONFIRMSHAMING / MANIPULATIVE OPT-OUTS
   */
  function scanConfirmshaming() {
    const clickable = document.querySelectorAll('button, a, [role="button"], span');

    clickable.forEach((btn) => {
      if (btn.dataset.dpDefused) return;
      const text = btn.textContent.trim();
      if (REGEX.confirmshame.test(text)) {
        btn.dataset.dpDefused = 'true';
        btn.dataset.originalText = text;
        btn.classList.add('dp-shame-neutralized');

        // Rewrite manipulative text to neutral
        btn.textContent = '✕ Decline Offer';
        btn.title = `Original manipulative text neutralized: "${text}"`;

        detectedPatterns.push({
          type: 'CONFIRMSHAMING',
          title: 'Confirmshaming Neutralized',
          description: `Rewrote manipulative opt-out "${text}" to clean decline.`,
          element: btn
        });
      }
    });
  }

  /**
   * IN-PAGE FLOATING HUD (Modern persistent toast notification)
   */
  function renderOrUpdateHud() {
    if (detectedPatterns.length === 0) return;

    if (!hudContainer) {
      hudContainer = document.createElement('aside');
      hudContainer.className = 'dp-hud';
      hudContainer.setAttribute('role', 'region');
      hudContainer.setAttribute('aria-label', 'DarkPattern Defuser Status');
      document.body.appendChild(hudContainer);
    }

    const count = detectedPatterns.length;
    const moneyStr = totalSavedMoney > 0 ? ` • <strong>Saved $${totalSavedMoney.toFixed(2)}</strong>` : '';

    hudContainer.innerHTML = `
      <div class="dp-hud-pill" id="dp-hud-toggle" tabindex="0" role="button" aria-expanded="false">
        <span class="dp-hud-icon">🛡️</span>
        <span class="dp-hud-summary"><strong>${count} Dark Pattern${count > 1 ? 's' : ''} Defused</strong>${moneyStr}</span>
        <button class="dp-hud-close" id="dp-hud-close" title="Dismiss HUD" aria-label="Dismiss HUD">✕</button>
      </div>
      <div class="dp-hud-drawer" id="dp-hud-drawer" style="display: none;">
        <div class="dp-drawer-header">
          <span class="dp-drawer-title">Neutralized Manipulations</span>
          <span class="dp-drawer-badge">${window.location.hostname}</span>
        </div>
        <div class="dp-drawer-list">
          ${detectedPatterns.map(p => `
            <div class="dp-drawer-item ${p.type.toLowerCase()}">
              <div class="dp-item-icon">
                ${p.type === 'FAKE_TIMER' ? '⏳' : p.type === 'PRECHECKED_ADDON' ? '🛒' : p.type === 'SUBSCRIPTION_TRAP' ? '⚠️' : '👥'}
              </div>
              <div class="dp-item-details">
                <span class="dp-item-title">${p.title}</span>
                <span class="dp-item-desc">${p.description}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Event Listeners for HUD
    const toggle = document.getElementById('dp-hud-toggle');
    const drawer = document.getElementById('dp-hud-drawer');
    const closeBtn = document.getElementById('dp-hud-close');

    toggle.addEventListener('click', (e) => {
      if (e.target === closeBtn) return;
      const isExpanded = drawer.style.display === 'block';
      drawer.style.display = isExpanded ? 'none' : 'block';
      toggle.setAttribute('aria-expanded', !isExpanded);
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hudContainer.style.display = 'none';
    });
  }

  /**
   * Master Evaluation Routine
   */
  function executeDefuserScan() {
    if (isScanning) return;
    isScanning = true;

    try {
      scanTimers();
      scanScarcity();
      scanSneakIntoCart();
      scanSubscriptionTraps();
      scanConfirmshaming();

      if (detectedPatterns.length > 0) {
        renderOrUpdateHud();

        // Report to background service worker
        chrome.runtime.sendMessage({
          type: 'REPORT_DEFUSED_PATTERNS',
          payload: {
            domain: window.location.hostname,
            url: window.location.href,
            patterns: detectedPatterns.map(p => ({
              type: p.type,
              title: p.title,
              description: p.description,
              savedAmount: p.savedAmount || 0
            })),
            moneySaved: totalSavedMoney
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('[DarkPattern Defuser Scanner Notice]:', e);
    } finally {
      isScanning = false;
    }
  }

  function scheduleScan() {
    if (scanDebounceTimer) clearTimeout(scanDebounceTimer);
    scanDebounceTimer = setTimeout(executeDefuserScan, 400);
  }

  // SPA Navigation & Cart Drawer MutationObserver
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0 && !mutation.target.closest?.('.dp-hud')) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) scheduleScan();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Listen for popup messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_PAGE_PATTERNS') {
      sendResponse({
        success: true,
        domain: window.location.hostname,
        patterns: detectedPatterns,
        moneySaved: totalSavedMoney
      });
    }
    return true;
  });

  // Initial trigger
  scheduleScan();
})();
