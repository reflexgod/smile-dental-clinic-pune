/**
 * Verification script for the AI Receptionist for Dental Clinics demo.
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
  'assets/js/chat.js',
  'assets/vendor/n8n-chat/n8n-chat.js',
  'assets/vendor/n8n-chat/style.css',
];

for (const rel of requiredFiles) {
  check(fs.existsSync(path.join(ROOT, rel)), `File exists: ${rel}`);
}

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
check(
  html.includes('<h1>AI Receptionist for Dental Clinics</h1>'),
  'Header text "AI Receptionist for Dental Clinics" is present'
);
check(
  html.includes('Answers patient questions 24/7 and collects appointment requests.'),
  'Subtitle text is present'
);
check(html.includes('id="n8n-chat"'), '#n8n-chat container is present');

const chatJs = fs.readFileSync(path.join(ROOT, 'assets/js/chat.js'), 'utf8');
const expectedWebhook =
  'https://viraaj19.app.n8n.cloud/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat';
check(chatJs.includes(expectedWebhook), 'Exact n8n webhook URL is configured');
check(
  chatJs.includes('Hi! I’m Riya, your dental clinic assistant. How can I help you today?'),
  'Riya initial message is configured'
);
check(chatJs.includes("title: 'Riya'"), 'Chatbot name "Riya" is configured');
check(chatJs.includes("mode: 'fullscreen'"), 'Fullscreen embedded chat mode is configured');

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll checks passed.');

