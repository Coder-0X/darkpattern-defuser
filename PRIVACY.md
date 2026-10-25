# Privacy Policy for DarkPattern Defuser

**Effective Date:** October 25, 2026  
**Developer:** Coder-0X  
**Product:** DarkPattern Defuser (Browser Extension for Microsoft Edge & Google Chrome)

---

## 1. Zero Data Collection Architecture
DarkPattern Defuser is engineered on a **strict local-only, zero-telemetry architecture**:
- We do **NOT** collect, transmit, store, sell, or analyze your personal information.
- We do **NOT** track your identity, your shopping cart contents, your payment details, or your browsing history.
- We operate **no external servers**, telemetry endpoints, tracking pixels, or remote analytics services.

---

## 2. Permissions & Technical Justifications

DarkPattern Defuser requests only the permissions necessary to inspect and defuse manipulative e-commerce elements directly on your machine:

| Permission | Purpose & Scope |
| :--- | :--- |
| `storage` | Stores your local protection settings, defused dark pattern count, and estimated money saved strictly inside your browser's private sandboxed storage (`chrome.storage.local`). Never uploaded to the cloud. |
| `alarms` | Used to schedule lightweight local memory management and cache cleanup within the background service worker. |
| `*://*/*` (Host Permissions) | Enables the content script to inspect web pages and checkout forms across diverse independent e-commerce domains (Shopify, WooCommerce, BigCommerce, Magento, Amazon, etc.) to detect deceptive timers and pre-selected add-ons. |

---

## 3. How Page Elements Are Handled
When you browse an online store:
1. The extension analyzes the publicly visible text and input elements of the web page (e.g., countdown timer text, viewer counters, pre-checked checkboxes) in volatile local browser memory.
2. If an auto-checked add-on (such as shipping insurance) or fake urgency loop is found, the extension neutralizes it directly in your browser's local Document Object Model (DOM).
3. All calculations, element modifications, and tally logs remain strictly confined to your device.

---

## 4. Third-Party Services
DarkPattern Defuser does not integrate with any third-party analytics (e.g., Google Analytics, Mixpanel, Sentry) or advertising networks.

---

## 5. User Control & Data Deletion
Because all data resides exclusively in your browser's `chrome.storage.local`:
- You have complete control over your data.
- You can clear your analysis history anytime via the "Clear" button in the popup.
- Uninstalling the extension immediately and permanently removes all stored data from your browser.

---

## 6. Open Source Code & Auditing
DarkPattern Defuser is open-source. You can inspect the source code, verify privacy claims, or submit inquiries via GitHub:
- **Repository:** [https://github.com/Coder-0X/darkpattern-defuser](https://github.com/Coder-0X/darkpattern-defuser)
- **Developer:** Coder-0X
