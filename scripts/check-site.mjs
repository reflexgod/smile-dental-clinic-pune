import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

const requiredFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  '.nojekyll',
  'assets/mascot-riya.svg',
  'assets/css/styles.css',
  'assets/js/early.js',
  'assets/js/main.js',
  'assets/js/chat.js',
  'assets/vendor/n8n-chat/n8n-chat.js',
  'assets/vendor/n8n-chat/style.css',
  'assets/images/hero-896.webp',
  'assets/images/hero-720.webp',
  'assets/images/smile-640.webp',
  'assets/images/care-1264.webp',
  'assets/images/reception-1264.webp',
  'assets/images/dentist-720.webp',
  'assets/images/studio-1264.webp',
  'assets/images/og-image.jpg',
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing required file: ${relPath}`);
  }
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const chatJs = fs.readFileSync(path.join(root, 'assets/js/chat.js'), 'utf8');
const mascotSvg = fs.readFileSync(path.join(root, 'assets/mascot-riya.svg'), 'utf8');

const expectedWebhook =
  'https://viraaj19.app.n8n.cloud/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat';
const expectedGreeting =
  "Hi! I'm Riya from Smile Dental Clinic, Pune. How can I help you today?";

if (!chatJs.includes(expectedWebhook)) {
  errors.push('assets/js/chat.js does not contain the exact required n8n webhook URL.');
}

if (!chatJs.includes(expectedGreeting)) {
  errors.push('assets/js/chat.js does not contain the exact required Riya greeting.');
}

if (!chatJs.includes("mode: 'window'")) {
  errors.push("assets/js/chat.js must configure @n8n/chat in floating window mode (mode: 'window').");
}

if (!mascotSvg.includes('<svg') || !mascotSvg.includes('riya-enamel')) {
  errors.push('assets/mascot-riya.svg is missing expected custom vector mascot artwork.');
}

const requiredSections = [
  'id="philosophy"',
  'id="treatments"',
  'id="doctor"',
  'id="journey"',
  'id="spaces"',
  'id="comfort"',
  'id="faq"',
  'id="contact"',
  'id="n8n-chat"',
];

for (const token of requiredSections) {
  if (!html.includes(token)) {
    errors.push(`index.html is missing required section or mount element: ${token}`);
  }
}

if (errors.length > 0) {
  console.error('Site verification failed:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}

console.log('✓ All static site, mascot, section, and floating @n8n/chat checks passed.');
