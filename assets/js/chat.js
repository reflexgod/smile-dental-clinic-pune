/**
 * Riya — AI receptionist powered by the official @n8n/chat widget (v1.42.6, self-hosted
 * in assets/vendor/n8n-chat). The widget is loaded lazily after the page is idle, or
 * immediately when a visitor clicks any chat CTA, so it never slows down first paint.
 */

// Exact n8n Chat Trigger webhook URL. Do not change.
export const WEBHOOK_URL =
  'https://viraaj19.app.n8n.cloud/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat';

const WIDGET_JS = new URL('../vendor/n8n-chat/n8n-chat.js', import.meta.url).href;
const WIDGET_CSS = new URL('../vendor/n8n-chat/style.css', import.meta.url).href;
const ROOT_SELECTOR = '#n8n-chat';

let loadPromise = null;

const $ = (sel) => document.querySelector(sel);

function waitFor(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const found = $(selector);
    if (found) return resolve(found);
    const observer = new MutationObserver(() => {
      const el = $(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timed out waiting for ${selector}`));
    }, timeout);
  });
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

function loadStylesheet(href) {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = link.onerror = resolve;
    // Insert before our own stylesheet so site theme variables & overrides win.
    const ours = document.querySelector('link[href$="styles.css"]');
    document.head.insertBefore(link, ours);
  });
}

function getToggle() {
  return $(`${ROOT_SELECTOR} .chat-window-toggle`);
}

export function isOpen() {
  const win = $(`${ROOT_SELECTOR} .chat-window`);
  return !!win && getComputedStyle(win).display !== 'none';
}

/** The widget renders its launcher as a <div>; make it keyboard & screen-reader friendly. */
function enhanceAccessibility() {
  const toggle = getToggle();
  const win = $(`${ROOT_SELECTOR} .chat-window`);
  if (!toggle || !win) return;

  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle.click();
    }
  });

  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Chat with Riya, AI receptionist');

  // The widget header uses an <h1>; expose it as a level-2 heading so the page keeps a
  // single top-level heading (without touching DOM nodes that Vue manages).
  win.querySelector('.chat-header h1')?.setAttribute('aria-level', '2');

  const sync = () => {
    const open = isOpen();
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close chat with Riya' : 'Open chat with Riya, AI receptionist');
    document.dispatchEvent(new CustomEvent('riya:toggle', { detail: { open } }));
  };
  new MutationObserver(sync).observe(win, { attributes: true, attributeFilter: ['style'] });
  sync();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      toggle.click();
      toggle.focus();
    }
  });
}

export function loadChat() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const [{ createChat }] = await Promise.all([import(WIDGET_JS), loadStylesheet(WIDGET_CSS)]);

    createChat({
      webhookUrl: WEBHOOK_URL,
      webhookConfig: { method: 'POST', headers: {} },
      target: ROOT_SELECTOR,
      mode: 'window',
      showWelcomeScreen: false,
      loadPreviousSession: false,
      enableStreaming: false,
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      defaultLanguage: 'en',
      metadata: { source: 'smile-dental-clinic-pune-demo' },
      initialMessages: ["Hi! I’m Riya from Smile Dental Clinic, Pune. How can I help you today?"],
      i18n: {
        en: {
          title: 'Chat with Riya',
          subtitle: 'AI receptionist · Answers questions & collects appointment requests',
          footer: '',
          getStarted: 'New conversation',
          inputPlaceholder: 'Type your message…',
          closeButtonTooltip: 'Close chat',
        },
      },
    });

    await waitFor(`${ROOT_SELECTOR} .chat-window-toggle`);
    enhanceAccessibility();
    document.documentElement.classList.add('chat-ready');
    document.dispatchEvent(new CustomEvent('riya:ready'));
  })().catch((err) => {
    console.error('[Riya] Chat widget failed to load:', err);
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}

/**
 * Open the chat window. Optionally prefill a message, and optionally send it.
 * Messages are only sent on an explicit visitor action (button click / form submit).
 */
export async function openChat({ message = '', send = false } = {}) {
  await loadChat();
  if (!isOpen()) getToggle()?.click();

  const textarea = await waitFor(`${ROOT_SELECTOR} .chat-window textarea`);
  await nextFrame();

  if (message) {
    textarea.value = message;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();
    if (send) {
      const sendBtn = $(`${ROOT_SELECTOR} .chat-input-send-button`);
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
        await nextFrame();
      }
    }
  }
  textarea.focus({ preventScroll: true });
}
