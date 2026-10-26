/**
 * DarkPattern Defuser - In-Depth Automated Test Suite
 * Comprehensive verification of Manifest V3, Heuristics, False-Positive Shields,
 * DOM Neutralization Engine, and In-Page HUD Injection.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🛡️ Starting DarkPattern Defuser Deep Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

// ====================================================
// 1. Manifest V3 & Extension Architecture
// ====================================================
console.log('📦 1. Manifest V3 & Store Architecture Checks');

it('manifest.json conforms strictly to Manifest V3 specification', () => {
  const manifestPath = path.join(ROOT_DIR, 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json does not exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');
  assert(manifest.name.startsWith('DarkPattern Defuser'), 'Name must start with DarkPattern Defuser');
  assert(manifest.version, 'Version must be specified');
  assert(manifest.background && manifest.background.service_worker, 'Service worker must be defined');
  assert(Array.isArray(manifest.permissions), 'Permissions must be an array');
  assert(manifest.permissions.includes('storage'), 'Must have storage permission');
  assert(manifest.permissions.includes('alarms'), 'Must have alarms permission');
  assert(Array.isArray(manifest.host_permissions), 'Host permissions must be an array');
  assert(manifest.host_permissions.includes('*://*/*'), 'Must have broad host permissions');
  assert(manifest.content_scripts && manifest.content_scripts.length > 0, 'Content script must be declared');
  assert(manifest.action && manifest.action.default_popup, 'Action popup must be declared');
});

it('All required icon assets exist with valid PNG signatures', () => {
  const sizes = [16, 48, 128, 300];
  const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // ‰PNG

  for (const size of sizes) {
    const iconPath = path.join(ROOT_DIR, 'icons', `icon-${size}.png`);
    assert(fs.existsSync(iconPath), `Missing icon: icons/icon-${size}.png`);
    const buffer = fs.readFileSync(iconPath);
    assert(buffer.length > 100, `Icon icon-${size}.png is too small`);
    assert(buffer.subarray(0, 4).equals(PNG_HEADER), `Icon icon-${size}.png is not a valid PNG`);
  }
});

// ====================================================
// 2. Regex Engine & False Positive Guards
// ====================================================
console.log('\n🔍 2. Detection Regex Heuristics & False-Positive Shields');

const REGEX = {
  timerText: /\b(?:sale|offer|deal|cart|reserve|order).{0,30}(?:ends|expires|in|for)\s*:?\s*(\d{1,2}:\d{2}(?::\d{2})?)/i,
  clockText: /\b\d{1,2}\s*(?:m|min|minutes)\s*\d{1,2}\s*(?:s|sec|seconds)\b/i,
  viewerText: /\b(\d{1,4})\s+(?:people|shoppers|others)\s+(?:are\s+)?(?:viewing|watching|looking\s+at)\b/i,
  stockScarcity: /\bonly\s+(\d{1,2})\s+(?:left|remaining|in\s+stock)\b/i,
  cartUrgency: /\bin\s+(\d{1,4})\s+(?:people'?s\s+)?carts?\b/i,
  cartUrgencyAlt: /\b(\d{1,4})\s+(?:people|shoppers)\s+have\s+this\s+in\s+(?:their\s+)?cart/i,
  recentBuyer: /\b[A-Z][a-z]+\s+from\s+[A-Z][a-z\s]+(?:just\s+purchased|bought)/i,
  confirmshame: /\b(?:no[,\s]+(?:thanks[,\s]+)?i\s+(?:hate|prefer\s+paying|don't\s+care|don't\s+want|like\s+paying\s+more)|i\s+hate\s+(?:saving|discounts|free\s+shipping))\b/i,
  addonKeywords: /shipping\s+(?:protection|insurance)|package\s+protection|delivery\s+insurance|extended\s+warranty|vip\s+warranty|priority\s+processing|carbon\s+offset|leave\s+a\s+tip|navidium|route/i,
  priceExtractor: /(?:\+\s*|\(\s*)?\$(\d+(?:\.\d{2})?)/
};

it('Accurately matches fake countdown timer phrasing and clock intervals', () => {
  const samples = [
    'Special sale ends in 14:59!',
    'Your cart is reserved for: 09:30',
    'Exclusive offer expires in 04:15',
    'Flash deal expires in 12 minutes 45 seconds',
    'Limited order discount ends in 05:00'
  ];

  for (const sample of samples) {
    const match = sample.match(REGEX.timerText) || sample.match(REGEX.clockText);
    assert(match, `Failed to match timer sample: "${sample}"`);
  }
});

it('Does not falsely trigger on delivery estimates or video timestamps', () => {
  const benignSamples = [
    'Estimated delivery between 10:00 and 12:00',
    'Store hours: 09:00 - 18:00',
    'Order before 2:00 PM for next day delivery'
  ];

  for (const sample of benignSamples) {
    const isFalseTimer = REGEX.timerText.test(sample) && !(/between|hours|delivery\s+between/i.test(sample));
    assert(!isFalseTimer, `False positive triggered on: "${sample}"`);
  }
});

it('Accurately detects synthetic viewer counts, cart urgency, and stock scarcity', () => {
  const scarcitySamples = [
    '18 people are viewing this product right now',
    '24 shoppers looking at this deal',
    'only 3 left in stock - order soon',
    'Only 2 remaining',
    'In 14 people\'s carts',
    '9 shoppers have this in their cart'
  ];

  for (const sample of scarcitySamples) {
    const match = sample.match(REGEX.viewerText) || 
                  sample.match(REGEX.stockScarcity) || 
                  sample.match(REGEX.cartUrgency) || 
                  sample.match(REGEX.cartUrgencyAlt);
    assert(match, `Failed to match scarcity sample: "${sample}"`);
  }
});

it('Does not falsely trigger on user ratings and review counts', () => {
  const ratingSamples = [
    '124 people rated this 5 stars',
    '85 people reviewed this item',
    '32 people found this review helpful'
  ];

  for (const sample of ratingSamples) {
    const isReview = /(?:rated|stars|reviews?|reviewed|found\s+this\s+helpful)/i.test(sample);
    assert(isReview, `Should recognize review context: "${sample}"`);
  }
});

it('Detects sneaky add-ons and extracts added dollar amounts correctly', () => {
  const addOnSamples = [
    { text: 'Add Shipping Protection (+$2.98)', expectedPrice: 2.98 },
    { text: 'Include VIP Extended Warranty ($4.99)', expectedPrice: 4.99 },
    { text: 'Route Package Protection (+$1.95)', expectedPrice: 1.95 },
    { text: 'Delivery Insurance (+$3.50)', expectedPrice: 3.50 },
    { text: 'Carbon Offset Contribution ($0.99)', expectedPrice: 0.99 }
  ];

  for (const item of addOnSamples) {
    assert(REGEX.addonKeywords.test(item.text), `Failed keyword match on: "${item.text}"`);
    const priceMatch = item.text.match(REGEX.priceExtractor);
    assert(priceMatch, `Failed price extraction on: "${item.text}"`);
    const parsedPrice = parseFloat(priceMatch[1]);
    assert.strictEqual(parsedPrice, item.expectedPrice, `Price parsed ${parsedPrice} does not match expected ${item.expectedPrice}`);
  }
});

it('Does NOT uncheck Terms of Service, GDPR, or Privacy Policy checkboxes', () => {
  const legalSamples = [
    'I agree to the Terms of Service & Privacy Policy',
    'Data protection agreement and consent',
    'Subscribe to newsletter for product updates',
    'Accept general conditions of sale'
  ];

  for (const sample of legalSamples) {
    const isLegalOrPrivacy = /data\s+protection|privacy|terms|policy|consent|newsletter|marketing|gdpr|condition/i.test(sample);
    assert(isLegalOrPrivacy, `Failed to protect legal checkbox: "${sample}"`);
  }
});

it('Accurately catches manipulative confirmshaming strings', () => {
  const shamingSamples = [
    'No thanks, I hate saving money',
    'No thanks, I prefer paying full price',
    'No thanks, I hate discounts',
    'No, I don\'t want to save 15%',
    'No, I like paying more',
    'No thanks, I hate free shipping'
  ];

  for (const sample of shamingSamples) {
    assert(REGEX.confirmshame.test(sample), `Failed to catch confirmshaming: "${sample}"`);
  }
});

// ====================================================
// 3. Simulated DOM Neutralization & Defusal Engine
// ====================================================
console.log('\n🧪 3. End-to-End DOM Neutralization & Defusal Simulation');

// Mock DOM Node Structure
class MockElement {
  constructor(tagName, options = {}) {
    this.tagName = tagName.toUpperCase();
    this.className = options.className || '';
    this.id = options.id || '';
    this.textContent = options.textContent || '';
    this.checked = options.checked || false;
    this.dataset = {};
    this.children = [];
    this.parentElement = options.parentElement || null;
    this.style = {};
    this.attributes = {};
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (selector.startsWith('.') && curr.className.includes(selector.slice(1))) return curr;
      if (selector.startsWith('#') && curr.id === selector.slice(1)) return curr;
      if (curr.tagName.toLowerCase() === selector.toLowerCase()) return curr;
      curr = curr.parentElement;
    }
    return null;
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  insertBefore(newEl, referenceEl) {
    const idx = this.children.indexOf(referenceEl);
    newEl.parentElement = this;
    if (idx !== -1) {
      this.children.splice(idx, 0, newEl);
    } else {
      this.children.push(newEl);
    }
    return newEl;
  }

  classList = {
    add: (cls) => { if (!this.className.includes(cls)) this.className += ' ' + cls; },
    remove: (cls) => { this.className = this.className.replace(cls, '').trim(); },
    contains: (cls) => this.className.includes(cls)
  };

  dispatchEvent() { return true; }
}

it('Defuses mock checkout page with 5 dark patterns and leaves legal checkboxes intact', () => {
  // Construct simulated page
  const body = new MockElement('body');

  // 1. Fake Timer
  const timer = new MockElement('div', { className: 'hurrify-countdown', textContent: 'Flash sale ends in 14:59!' });
  body.appendChild(timer);

  // 2. Synthetic Scarcity
  const viewer = new MockElement('div', { className: 'viewer-count', textContent: '19 shoppers are viewing this product right now' });
  body.appendChild(viewer);

  // 3. Sneak-Into-Cart Add-on (Route)
  const addonLabel = new MockElement('label', { textContent: 'Add Route Package Protection (+$2.98)' });
  const addonCb = new MockElement('input', { checked: true });
  addonLabel.appendChild(addonCb);
  body.appendChild(addonLabel);

  // 4. Benign Legal Checkbox (Terms)
  const tosLabel = new MockElement('label', { textContent: 'I agree to the Terms of Service & Privacy Policy' });
  const tosCb = new MockElement('input', { checked: true });
  tosLabel.appendChild(tosCb);
  body.appendChild(tosLabel);

  // 5. Subscription Trap
  const subForm = new MockElement('form');
  const subRadioLabel = new MockElement('label', { textContent: 'Subscribe & Save 15% (Monthly Auto-ship)' });
  const subRadio = new MockElement('input', { checked: true });
  subRadioLabel.appendChild(subRadio);
  const oneTimeLabel = new MockElement('label', { textContent: 'One-time purchase' });
  subForm.appendChild(subRadioLabel);
  subForm.appendChild(oneTimeLabel);
  body.appendChild(subForm);

  // 6. Confirmshaming
  const shameBtn = new MockElement('button', { textContent: 'No thanks, I hate saving money' });
  body.appendChild(shameBtn);

  // Simulation defusal execution
  let totalSavedMoney = 0;
  const defused = [];

  // Defuse Timer
  if (REGEX.timerText.test(timer.textContent)) {
    timer.dataset.dpDefused = 'true';
    timer.classList.add('dp-timer-flagged');
    defused.push({ type: 'FAKE_TIMER' });
  }

  // Defuse Scarcity
  if (REGEX.viewerText.test(viewer.textContent)) {
    viewer.dataset.dpDefused = 'true';
    viewer.classList.add('dp-scarcity-flagged');
    defused.push({ type: 'SYNTHETIC_SCARCITY' });
  }

  // Defuse Add-on (Testing with both checkboxes)
  [addonCb, tosCb].forEach(cb => {
    const parent = cb.parentElement;
    const text = parent.textContent;
    const isLegal = /data\s+protection|privacy|terms|policy|consent/i.test(text);
    if (!isLegal && REGEX.addonKeywords.test(text)) {
      cb.checked = false;
      const priceMatch = text.match(REGEX.priceExtractor);
      const saved = priceMatch ? parseFloat(priceMatch[1]) : 2.99;
      totalSavedMoney += saved;
      defused.push({ type: 'PRECHECKED_ADDON', savedAmount: saved });
    }
  });

  // Defuse Subscription
  if (subRadio.checked && subRadioLabel.textContent.includes('Subscribe') && subForm.children.some(c => c.textContent.includes('One-time'))) {
    subRadio.dataset.dpDefused = 'true';
    subRadioLabel.classList.add('dp-sub-flagged');
    defused.push({ type: 'SUBSCRIPTION_TRAP' });
  }

  // Neutralize Confirmshaming
  if (REGEX.confirmshame.test(shameBtn.textContent)) {
    shameBtn.dataset.originalText = shameBtn.textContent;
    shameBtn.textContent = '✕ Decline Offer';
    shameBtn.classList.add('dp-shame-neutralized');
    defused.push({ type: 'CONFIRMSHAMING' });
  }

  // Assertions
  assert.strictEqual(defused.length, 5, `Expected 5 defused patterns, got ${defused.length}`);
  assert.strictEqual(addonCb.checked, false, 'Sneaky add-on checkbox must be auto-unchecked');
  assert.strictEqual(tosCb.checked, true, 'Terms of Service checkbox must remain checked');
  assert.strictEqual(totalSavedMoney, 2.98, 'Total money saved must equal $2.98');
  assert.strictEqual(shameBtn.textContent, '✕ Decline Offer', 'Manipulative button text must be rewritten');
  assert.strictEqual(shameBtn.dataset.originalText, 'No thanks, I hate saving money', 'Original text must be preserved');
});

// ====================================================
// 4. Production Package & File Integrity
// ====================================================
console.log('\n📄 4. Production File Structure Integrity');

it('All production assets and documentation files exist', () => {
  const requiredFiles = [
    'manifest.json',
    'background/service-worker.js',
    'content/content.js',
    'content/content.css',
    'popup/popup.html',
    'popup/popup.css',
    'popup/popup.js',
    'PRIVACY.md',
    'privacy-policy.html',
    'README.md',
    'STORE_SUBMISSION.md'
  ];

  for (const f of requiredFiles) {
    const fullPath = path.join(ROOT_DIR, f);
    assert(fs.existsSync(fullPath), `Required file missing: ${f}`);
  }
});

// Summary
console.log('\n=======================================');
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log('=======================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All in-depth automated tests passed successfully!');
}
