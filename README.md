# 🛡️ DarkPattern Defuser

> **Real-Time Anti-Deception & Cart Protection Shield** — Automatically detecting and defusing fake countdown timers, synthetic scarcity, sneak-into-cart add-ons, subscription traps, and confirmshaming across the web.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=flat-square&color=10B981)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Zero Data Collection](https://img.shields.io/badge/Privacy-100%25%20Local-059669?style=flat-square)](PRIVACY.md)
[![Edge & Chrome Ready](https://img.shields.io/badge/Compatibility-Edge%20%7C%20Chrome%20%7C%20Brave-blue?style=flat-square)](https://github.com/Coder-0X/darkpattern-defuser)

---

## ⚡ The Problem
E-commerce storefronts, travel booking aggregators, and dropshipping sites routinely employ **Dark Patterns**—deceptive user interface tricks designed to manipulate human cognitive biases:

1. **Fake Countdown Timers**: Timers claiming a sale ends in 15:00 that simply loop back to 15:00 or reset on page refresh.
2. **Synthetic Social Proof & Fake Viewers**: Dynamic toasts claiming *"18 people are viewing this"* or *"Jessica from Austin just bought this"* powered by random number generators.
3. **Sneak-Into-Cart Add-ons**: Checkboxes for shipping insurance ($1.95–$4.95), extended warranties, and tips pre-checked by default without consumer consent.
4. **Subscription Traps**: "Subscribe & Save" auto-delivery pre-selected by default over standard one-time purchase.
5. **Confirmshaming**: Exit-intent decline buttons saying *"No thanks, I hate saving money"* or *"I prefer paying full price"*.

---

## 🛡️ What DarkPattern Defuser Does

DarkPattern Defuser injects a real-time protection layer into web pages:

- ⏳ **Fake Countdown Freeze & Tagging**:
  - Identifies client-side countdown loops and flags them as **"Synthetic Urgency"**.
- 👥 **Synthetic Scarcity Muter**:
  - Detects random-number viewer counters and unverified purchase toasts (Fera, Nudgify, Loox, Beeketing), muting the deception.
- 🛒 **Sneak-Into-Cart Auto-Uncheck**:
  - Automatically unchecks pre-selected shipping insurance (Route, Navidium), protection plans, and hidden fees.
  - Tallying your **exact cumulative money saved** across shopping sessions!
- ⚠️ **Subscription Trap Guard**:
  - Flags pre-selected recurring billing options, alerting you before you commit to unexpected recurring charges.
- ✕ **Confirmshaming Neutralizer**:
  - Rewrites manipulative guilt-trip decline buttons (*"No thanks, I hate saving money"*) to clean, neutral decline controls (*"✕ Decline Offer"*).
- 📌 **Modern In-Page Defuser HUD**:
  - Non-intrusive floating status pill at the bottom of the viewport showing live defused manipulations and saved amounts with an expandable breakdown.

---

## 🔒 100% Local & Privacy First
- **Zero telemetry, zero cloud calls, zero account logins.**
- All DOM evaluations and element adjustments occur in ephemeral local browser memory.
- Savings statistics and settings are saved exclusively in `chrome.storage.local`.

---

## 🚀 Installation & Local Development

### Load in Developer Mode (Chrome, Edge, Brave, Opera)
1. Clone this repository:
   ```bash
   git clone https://github.com/Coder-0X/darkpattern-defuser.git
   ```
2. Open your browser's extension management page:
   - Chrome / Brave: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Toggle **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `darkpattern-defuser` folder.
5. Visit any online shopping or checkout page to watch the defuser shield neutralize manipulative patterns in real time!

---

## 📦 Store Distribution Package
The production-ready extension package is located in `dist/darkpattern-defuser-v1.0.0.zip`.

---

## 📄 License
MIT License. Created by [Coder-0X](https://github.com/Coder-0X).
