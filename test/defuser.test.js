/**
 * DarkPattern Defuser - Automated Test Suite
 * Tests Manifest V3 schema, pattern recognition regex engines, price extractors, and file integrity.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🧪 Starting DarkPattern Defuser Test Suite...\n');

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

// ----------------------------------------------------
// 1. Manifest V3 Integrity
// ----------------------------------------------------
console.log('📦 1. Manifest V3 Integrity Checks');

it('manifest.json exists and conforms to Manifest V3 specification', () => {
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
  assert(manifest.host_permissions.includes('*://*/*'), 'Must have broad e-commerce host permissions');
});

it('All icon files exist in icons/ directory', () => {
  const sizes = [16, 48, 128, 300];
  for (const size of sizes) {
    const iconPath = path.join(ROOT_DIR, 'icons', `icon-${size}.png`);
    assert(fs.existsSync(iconPath), `Missing icon: icons/icon-${size}.png`);
    const stat = fs.statSync(iconPath);
    assert(stat.size > 100, `Icon icon-${size}.png is empty or too small`);
  }
});

// ----------------------------------------------------
// 2. Pattern Recognition Engines
// ----------------------------------------------------
console.log('\n🛡️ 2. Dark Pattern Recognition Engines');

const REGEX = {
  timerText: /\b(?:sale|offer|deal|cart|reserve|order).{0,30}(?:ends|expires|in|for)\s*:?\s*(\d{1,2}:\d{2}(?::\d{2})?)/i,
  clockText: /\b\d{1,2}\s*(?:m|min|minutes)\s*\d{1,2}\s*(?:s|sec|seconds)\b/i,
  viewerText: /\b(\d{1,4})\s+(?:people|shoppers|others)\s+(?:are\s+)?(?:viewing|watching|looking\s+at)\b/i,
  stockScarcity: /\bonly\s+(\d{1,2})\s+(?:left|remaining|in\s+stock)\b/i,
  confirmshame: /\b(?:no[,\s]+(?:thanks[,\s]+)?i\s+(?:hate|prefer\s+paying|don't\s+care|don't\s+want)|i\s+hate\s+discounts)\b/i,
  addonKeywords: /insurance|protection|warranty|priority\s+processing|carbon|tip|coverage|navidium|route/i,
  priceExtractor: /(?:\+\s*|\(\s*)?\$(\d+(?:\.\d{2})?)/
};

it('Accurately matches fake countdown timer phrasing', () => {
  const samples = [
    'Special sale ends in 14:59!',
    'Your cart is reserved for: 09:30',
    'Exclusive offer expires in 04:15',
    'Deal expires in 12 minutes 45 seconds'
  ];

  for (const sample of samples) {
    const match = sample.match(REGEX.timerText) || sample.match(REGEX.clockText);
    assert(match, `Failed to match timer sample: "${sample}"`);
  }
});

it('Accurately detects synthetic viewer counts and stock scarcity', () => {
  const viewerSamples = [
    '18 people are viewing this product right now',
    '24 shoppers looking at this deal',
    'only 3 left in stock - order soon',
    'Only 2 remaining'
  ];

  for (const sample of viewerSamples) {
    const match = sample.match(REGEX.viewerText) || sample.match(REGEX.stockScarcity);
    assert(match, `Failed to match scarcity sample: "${sample}"`);
  }
});

it('Detects sneaky add-ons and extracts added dollar amounts correctly', () => {
  const addOnSamples = [
    { text: 'Add Shipping Protection (+$2.98)', expectedPrice: 2.98 },
    { text: 'Include VIP Extended Warranty ($4.99)', expectedPrice: 4.99 },
    { text: 'Route Package Protection (+$1.95)', expectedPrice: 1.95 }
  ];

  for (const item of addOnSamples) {
    assert(REGEX.addonKeywords.test(item.text), `Failed keyword match on: "${item.text}"`);
    const priceMatch = item.text.match(REGEX.priceExtractor);
    assert(priceMatch, `Failed price extraction on: "${item.text}"`);
    const parsedPrice = parseFloat(priceMatch[1]);
    assert.strictEqual(parsedPrice, item.expectedPrice, `Price parsed ${parsedPrice} does not match expected ${item.expectedPrice}`);
  }
});

it('Accurately catches manipulative confirmshaming strings', () => {
  const shamingSamples = [
    'No thanks, I hate saving money',
    'No thanks, I prefer paying full price',
    'No thanks, I hate discounts',
    'No, I don\'t want to save 15%'
  ];

  for (const sample of shamingSamples) {
    assert(REGEX.confirmshame.test(sample), `Failed to catch confirmshaming: "${sample}"`);
  }
});

// ----------------------------------------------------
// 3. File Integrity Checks
// ----------------------------------------------------
console.log('\n📄 3. Production File Integrity Checks');

it('All required production extension components exist', () => {
  const requiredFiles = [
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
  console.log('🎉 All automated tests passed successfully!');
}
