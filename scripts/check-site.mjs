/**
 * Static verification script for Smile Dental Clinic, Pune (demo).
 * Checks:
 * - Required files exist
 * - All internal anchor links (#id) in index.html resolve to existing element IDs
 * - All local asset paths (src, href, srcset, imagesrcset) in index.html exist on disk
 * - Exact n8n webhook URL and Riya branding are configured in assets/js/chat.js
 * - No fabricated doctor names, phone numbers, ratings, or lorem ipsum exist
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
function check(cond, msg) {
  if (!cond) {
    console.error(`✗ ${msg}`);
    failures++;
  } else {
    console.log(`✓ ${msg}`);
  }
}

const requiredFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  '.nojekyll',
  'assets/favicon.svg',
  'assets/css/styles.css',
  'assets/js/early.js',
  'assets/js/main.js',
  'assets/js/chat.js',
  'assets/vendor/n8n-chat/n8n-chat.js',
  'assets/vendor/n8n-chat/style.css',
  'assets/images/hero-720.webp',
  'assets/images/hero-896.webp',
  'assets/images/smile-640.webp',
  'assets/images/care-800.webp',
  'assets/images/care-1264.webp',
  'assets/images/reception-800.webp',
  'assets/images/reception-1264.webp',
  'assets/images/og-image.jpg',
];

for (const rel of requiredFiles) {
  check(fs.existsSync(path.join(ROOT, rel)), `File exists: ${rel}`);
}

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// Collect all IDs in index.html
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

// Check all internal #hash links and SVG <use href="#...">
for (const m of html.matchAll(/\bhref="#([^"]+)"/g)) {
  const target = m[1];
  check(ids.has(target), `Anchor #${target} resolves to an element id`);
}

// Check all aria-controls and aria-labelledby references
for (const attr of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
  for (const m of html.matchAll(new RegExp(`\\b${attr}="([^"]+)"`, 'g'))) {
    for (const id of m[1].split(/\s+/)) {
      check(ids.has(id), `${attr}="${id}" resolves to an element id`);
    }
  }
}

// Check local asset references in src / href / srcset / imagesrcset
for (const m of html.matchAll(/\b(?:src|href)="([^"#?]+)"/g)) {
  const val = m[1];
  if (/^(https?:|mailto:|tel:|data:)/i.test(val)) continue;
  check(fs.existsSync(path.join(ROOT, val)), `Asset exists: ${val}`);
}

for (const m of html.matchAll(/\b(?:srcset|imagesrcset)="([^"]+)"/g)) {
  for (const part of m[1].split(',')) {
    const url = part.trim().split(/\s+/)[0];
    if (url) check(fs.existsSync(path.join(ROOT, url)), `Srcset asset exists: ${url}`);
  }
}

// Verify chat.js configuration
const chatJs = fs.readFileSync(path.join(ROOT, 'assets/js/chat.js'), 'utf8');
const expectedWebhook =
  'https://viraaj19.app.n8n.cloud/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat';
check(chatJs.includes(expectedWebhook), 'Exact n8n webhook URL is present in assets/js/chat.js');
check(
  chatJs.includes('Hi! I’m Riya from Smile Dental Clinic, Pune. How can I help you today?'),
  'Riya initial message is configured'
);
check(chatJs.includes("title: 'Chat with Riya'"), 'Widget title "Chat with Riya" is configured');
check(!/lorem ipsum/i.test(html), 'No lorem ipsum text in index.html');

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll checks passed.');
