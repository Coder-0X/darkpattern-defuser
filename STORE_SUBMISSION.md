# Store Submission Guide for DarkPattern Defuser

Use this copy and metadata to submit DarkPattern Defuser to **Microsoft Edge Add-ons** and **Google Chrome Web Store**.

---

## 1. Extension Details

- **Name:** `DarkPattern Defuser - Anti-Deception & Fake Urgency Blocker`
- **Short Name:** `DarkPatternDefuser`
- **Short Description (Max 132 chars):**
  > Detects and defuses dark patterns: fake countdown timers, synthetic viewer counts, pre-checked add-ons, and subscription traps.
- **Category:** Productivity / Shopping / Security
- **Default Language:** English (United States)
- **Version:** `1.0.0`
- **Developer / Publisher Name:** `Coder-0X`
- **Privacy Policy URL:** `https://github.com/Coder-0X/darkpattern-defuser/blob/main/PRIVACY.md`
- **Support / Website URL:** `https://github.com/Coder-0X/darkpattern-defuser`

---

## 2. Detailed Store Description

```markdown
DarkPattern Defuser protects consumers from deceptive e-commerce tricks and manipulative user interfaces designed to exploit cognitive biases and extract extra money during checkout.

Stop falling for fake urgency, synthetic scarcity, and hidden fees. DarkPattern Defuser injects an anti-deception shield directly into web pages to neutralize manipulative traps in real time.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ FAKE COUNTDOWN TIMER DEFUSER
Detects client-side synthetic countdown timers that reset on page reload or loop indefinitely without genuine sale expiration. Tags and freezes synthetic urgency loops.

👥 SYNTHETIC SCARCITY & VIEWER COUNTER MUTER
Identifies random-number viewer counters ("18 people are viewing right now") and fake social proof purchase toasts (Fera, Nudgify, Loox, Beeketing), muting synthetic pressure.

🛒 SNEAK-INTO-CART ADD-ON DEFUSER & SAVINGS TALLY
Scans cart and checkout forms for pre-selected checkboxes (shipping insurance, extended warranties, package protection, default tips) and automatically unchecks them. Calculates your exact cumulative dollars saved!

⚠️ SUBSCRIPTION TRAP DETECTOR
Warns when recurring "Subscribe & Save" or auto-ship delivery options are quietly pre-selected over standard one-time purchases.

✕ CONFIRMSHAMING REWRITER
Neutralizes manipulative guilt-tripping opt-out buttons ("No thanks, I hate saving money") by automatically rewriting them into clean, dignified decline controls.

📌 NON-INTRUSIVE DEFUSER HUD
A sleek floating indicator at the bottom of the viewport summarizes neutralized traps on the current domain with 1-click controls.

🔒 100% LOCAL & PRIVATE
DarkPattern Defuser runs entirely within your browser's local memory. No accounts, no cloud tracking, and zero telemetry.
```

---

## 3. Single Purpose Justification (for Store Reviewers)

> **Single Purpose:**  
> The single purpose of DarkPattern Defuser is to detect, highlight, and neutralize deceptive user interface patterns (dark patterns)—such as fake countdown timers, synthetic viewer counts, pre-checked checkout add-ons, and confirmshaming—directly within web pages to protect consumers while browsing and shopping online.

---

## 4. Permissions Justifications (for Chrome/Edge Store Review)

| Requested Permission | Plain-English Justification for Store Reviewer |
| :--- | :--- |
| `storage` | Required to save user protection preferences, defused trap counters, and cumulative money saved within `chrome.storage.local`. All data is stored locally on the client machine. |
| `alarms` | Used to trigger periodic client-side memory cleanup routines within the background service worker. |
| `*://*/*` (Host Permissions) | Deceptive e-commerce patterns occur across thousands of independent shopping domains, Shopify merchants, WooCommerce storefronts, and booking aggregators. Host access is required to allow the content script to inspect web elements and neutralize deceptive DOM components on shopping and checkout pages visited by the user. |

---

## 5. Reviewer Notes / Testing Instructions

```text
To test this extension:
1. Navigate to any e-commerce product page featuring countdown timers (e.g., promotional sales on dropshipping or retail storefronts) or add an item to a cart on a store featuring pre-checked package protection (e.g. Route shipping protection).
2. Observe the DarkPattern Defuser pill badge appearing beside the element (e.g., "Fake Urgency: Synthetic Timer" or "Sneaky Add-on Defused: Auto-Unchecked").
3. Observe the floating Defuser HUD at the bottom-right corner displaying the total count of neutralized manipulations and cumulative money saved.
4. Click the extension toolbar icon to view the active page breakdown, feature toggles, and total savings statistics.
5. All calculations and DOM modifications are performed 100% locally on the client side.
```
