/**
 * DarkPattern Defuser - Background Service Worker (Manifest V3)
 * Tracks neutralized dark patterns, money saved from hidden add-ons, and badge alerts.
 */

chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    settings: {
      defuseTimers: true,
      defuseScarcity: true,
      defuseAddons: true,
      defuseSubscriptions: true,
      defuseShaming: true,
      showHud: true
    },
    stats: {
      patternsDefused: 0,
      timersFrozen: 0,
      fakeViewersMuted: 0,
      addonsUnchecked: 0,
      moneySavedEst: 0.00
    },
    history: []
  };

  const current = await chrome.storage.local.get(['settings', 'stats', 'history']);
  if (!current.settings) {
    await chrome.storage.local.set(defaults);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'REPORT_DEFUSED_PATTERNS') {
        const { domain, url, patterns, moneySaved } = message.payload;
        const data = await chrome.storage.local.get(['stats', 'history', 'settings']);

        const stats = data.stats || {
          patternsDefused: 0,
          timersFrozen: 0,
          fakeViewersMuted: 0,
          addonsUnchecked: 0,
          moneySavedEst: 0.00
        };
        const history = data.history || [];

        const count = patterns.length;
        stats.patternsDefused += count;

        patterns.forEach(p => {
          if (p.type === 'FAKE_TIMER') stats.timersFrozen += 1;
          if (p.type === 'SYNTHETIC_SCARCITY') stats.fakeViewersMuted += 1;
          if (p.type === 'PRECHECKED_ADDON') stats.addonsUnchecked += 1;
        });

        if (moneySaved && moneySaved > 0) {
          stats.moneySavedEst = +(stats.moneySavedEst + moneySaved).toFixed(2);
        }

        // Set Tab Badge
        if (sender.tab && sender.tab.id && count > 0) {
          await chrome.action.setBadgeText({ text: `${count}`, tabId: sender.tab.id });
          await chrome.action.setBadgeBackgroundColor({ color: '#10B981', tabId: sender.tab.id }); // Emerald = Defused
        }

        const updatedHistory = [
          {
            id: Date.now(),
            domain: domain || 'unknown',
            url: url || '',
            count: count,
            patterns: patterns.map(p => ({
              type: p.type,
              title: p.title,
              description: p.description,
              savedAmount: p.savedAmount || 0
            })),
            timestamp: new Date().toISOString()
          },
          ...history.filter(h => h.domain !== domain || (Date.now() - h.id > 3600000))
        ].slice(0, 50);

        await chrome.storage.local.set({ stats, history: updatedHistory });
        sendResponse({ success: true, stats });

      } else if (message.type === 'GET_DASHBOARD_DATA') {
        const data = await chrome.storage.local.get(['stats', 'history', 'settings']);
        sendResponse({ success: true, data });

      } else if (message.type === 'UPDATE_SETTINGS') {
        await chrome.storage.local.set({ settings: message.payload });
        // Broadcast settings update to all active web tabs
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (tab.id && tab.url && tab.url.startsWith('http')) {
            chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', payload: message.payload }).catch(() => {});
          }
        }
        sendResponse({ success: true });

      } else if (message.type === 'CLEAR_HISTORY') {
        await chrome.storage.local.set({
          history: [],
          stats: {
            patternsDefused: 0,
            timersFrozen: 0,
            fakeViewersMuted: 0,
            addonsUnchecked: 0,
            moneySavedEst: 0.00
          }
        });
        sendResponse({ success: true });
      }
    } catch (err) {
      console.error('[DarkPattern Defuser SW Error]:', err);
      sendResponse({ success: false, error: err.message });
    }
  })();
  return true;
});
