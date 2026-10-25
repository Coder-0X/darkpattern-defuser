/**
 * DarkPattern Defuser - Popup Controller
 * Connects with content script and background service worker to render live detections.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const currentDomainEl = document.getElementById('current-domain');
  const sitePatternPill = document.getElementById('site-pattern-pill');
  const pageTrapsList = document.getElementById('page-traps-list');

  const statDefused = document.getElementById('stat-defused');
  const statTimers = document.getElementById('stat-timers');
  const statSavings = document.getElementById('stat-savings');

  const historyList = document.getElementById('history-list');
  const clearBtn = document.getElementById('clear-btn');

  const toggleTimers = document.getElementById('toggle-timers');
  const toggleScarcity = document.getElementById('toggle-scarcity');
  const toggleAddons = document.getElementById('toggle-addons');
  const toggleShaming = document.getElementById('toggle-shaming');

  // 1. Inspect Active Tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.startsWith('http')) {
      const urlObj = new URL(tab.url);
      currentDomainEl.textContent = urlObj.hostname;

      chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_PATTERNS' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.patterns) {
          renderZeroTraps();
          return;
        }

        const patterns = response.patterns;
        if (patterns.length > 0) {
          sitePatternPill.textContent = `${patterns.length} Defused`;
          sitePatternPill.classList.add('warning');

          pageTrapsList.innerHTML = patterns.map(p => `
            <div class="page-trap-item">
              <span class="page-trap-icon">
                ${p.type === 'FAKE_TIMER' ? '⏳' : p.type === 'PRECHECKED_ADDON' ? '🛒' : p.type === 'SUBSCRIPTION_TRAP' ? '⚠️' : '👥'}
              </span>
              <span class="page-trap-title">${p.title}</span>
            </div>
          `).join('');
        } else {
          renderZeroTraps();
        }
      });
    } else {
      currentDomainEl.textContent = 'Browser Internal Page';
      renderZeroTraps();
    }
  } catch (e) {
    currentDomainEl.textContent = 'Active Page';
    renderZeroTraps();
  }

  function renderZeroTraps() {
    sitePatternPill.textContent = '0 Traps';
    sitePatternPill.classList.remove('warning');
    pageTrapsList.innerHTML = `
      <div class="clean-state">
        ✓ No deceptive timers, fake viewers, or sneaky add-ons detected on this page.
      </div>
    `;
  }

  // 2. Load Global Stats & History
  async function loadDashboard() {
    chrome.runtime.sendMessage({ type: 'GET_DASHBOARD_DATA' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) return;

      const { stats, history, settings } = response.data || {};

      if (stats) {
        statDefused.textContent = stats.patternsDefused || 0;
        statTimers.textContent = stats.timersFrozen || 0;
        statSavings.textContent = `$${(stats.moneySavedEst || 0).toFixed(2)}`;
      }

      if (settings) {
        toggleTimers.checked = settings.defuseTimers !== false;
        toggleScarcity.checked = settings.defuseScarcity !== false;
        toggleAddons.checked = settings.defuseAddons !== false;
        toggleShaming.checked = settings.defuseShaming !== false;
      }

      renderHistory(history || []);
    });
  }

  function renderHistory(items) {
    if (!items || items.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No dark patterns recorded yet.</div>';
      return;
    }

    historyList.innerHTML = items.slice(0, 10).map(item => `
      <div class="history-item">
        <span class="history-domain">${item.domain}</span>
        <span class="history-count">${item.count} defused</span>
      </div>
    `).join('');
  }

  // 3. Settings Toggles
  function saveSettings() {
    const newSettings = {
      defuseTimers: toggleTimers.checked,
      defuseScarcity: toggleScarcity.checked,
      defuseAddons: toggleAddons.checked,
      defuseShaming: toggleShaming.checked
    };
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: newSettings });
  }

  [toggleTimers, toggleScarcity, toggleAddons, toggleShaming].forEach(toggle => {
    toggle.addEventListener('change', saveSettings);
  });

  // 4. Clear History
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear all defused pattern history and reset stats?')) {
      chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' }, (resp) => {
        if (resp && resp.success) {
          statDefused.textContent = '0';
          statTimers.textContent = '0';
          statSavings.textContent = '$0.00';
          renderHistory([]);
        }
      });
    }
  });

  await loadDashboard();
});
