/**
 * Smile Dental Clinic, Pune — Official @n8n/chat Floating Receptionist Integration
 * Mounts Riya in floating window mode ('window') with a compact, brand-coherent
 * mascot launcher, header avatar, CTA prompt handoff, timestamps, and connection monitoring.
 */

import { createChat } from '../vendor/n8n-chat/n8n-chat.js';

const WEBHOOK_URL =
  'https://viraaj19.app.n8n.cloud/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat';

const ASSISTANT_NAME = 'Riya';
const INITIAL_GREETING =
  "Hi! I'm Riya from Smile Dental Clinic, Pune. How can I help you today?";

let lastPromptSent = '';
let isDecorating = false;

function formatTime(date = new Date()) {
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
}

function isChatWindowOpen() {
  const win = document.querySelector('#n8n-chat .chat-window');
  if (!win) return false;

  // When @n8n/chat closes the window, Vue's <Transition name="chat-window-transition">
  // immediately adds the leave classes while keeping display != 'none' until the
  // CSS transition finishes, and then sets style="display: none;".
  if (
    win.classList.contains('chat-window-transition-leave-from') ||
    win.classList.contains('chat-window-transition-leave-active') ||
    win.classList.contains('chat-window-transition-leave-to')
  ) {
    return false;
  }

  const inlineDisplay = win.style.display;
  const computedDisplay = window.getComputedStyle(win).display;
  return inlineDisplay !== 'none' && computedDisplay !== 'none';
}

function setAttrIfChanged(el, attr, value) {
  if (el && el.getAttribute(attr) !== value) {
    el.setAttribute(attr, value);
  }
}

function setTextIfChanged(el, text) {
  if (el && el.textContent !== text) {
    el.textContent = text;
  }
}

function setChatWindowOpen(shouldOpen) {
  const toggleBtn = document.querySelector('#n8n-chat .chat-window-toggle');
  if (!toggleBtn) return false;

  const currentlyOpen = isChatWindowOpen();
  if (shouldOpen !== currentlyOpen) {
    toggleBtn.click();
  }
  requestAnimationFrame(syncLauncherState);
  setTimeout(syncLauncherState, 40);
  if (shouldOpen) {
    setTimeout(() => {
      const textarea = document.querySelector('#n8n-chat .chat-input textarea');
      if (textarea) textarea.focus();
    }, 120);
  }
  return true;
}

function syncLauncherState() {
  const toggleBtn = document.querySelector('#n8n-chat .chat-window-toggle');
  if (!toggleBtn) return;

  const open = isChatWindowOpen();
  if (toggleBtn.classList.contains('is-open') !== open) {
    toggleBtn.classList.toggle('is-open', open);
  }
  setAttrIfChanged(toggleBtn, 'aria-expanded', String(open));
  setAttrIfChanged(
    toggleBtn,
    'aria-label',
    open ? 'Close chat with Riya' : 'Ask Riya, virtual receptionist'
  );

  const titleEl = toggleBtn.querySelector('.riya-launcher-label');
  setTextIfChanged(titleEl, open ? 'Close' : 'Ask Riya');
}

function decorateFloatingWidget() {
  if (isDecorating) return;
  const root = document.getElementById('n8n-chat');
  if (!root) return;

  isDecorating = true;
  try {
    // 1. Decorate Floating Launcher (.chat-window-toggle) with compact Riya Mascot + Label
    const toggleBtn = root.querySelector('.chat-window-toggle');
    if (toggleBtn && !toggleBtn.classList.contains('has-riya-launcher')) {
      toggleBtn.classList.add('has-riya-launcher');
      toggleBtn.setAttribute('role', 'button');
      toggleBtn.setAttribute('tabindex', '0');

      const launcherMarkup = document.createElement('span');
      launcherMarkup.className = 'riya-launcher-inner';
      launcherMarkup.innerHTML = `
        <span class="riya-launcher-avatar" aria-hidden="true">
          <img src="./assets/mascot-riya.svg" alt="" width="34" height="34" />
          <span class="riya-launcher-dot"></span>
        </span>
        <span class="riya-launcher-label">Ask Riya</span>
      `;
      toggleBtn.appendChild(launcherMarkup);

      toggleBtn.addEventListener('click', () => {
        requestAnimationFrame(syncLauncherState);
        setTimeout(syncLauncherState, 40);
        setTimeout(syncLauncherState, 360);
      });

      toggleBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleBtn.click();
        }
      });
    }

    // 2. Decorate Floating Chat Header (.chat-header) with Riya Mascot + Close Button
    const header = root.querySelector('.chat-header');
    const heading = root.querySelector('.chat-heading');
    if (header && heading && !header.querySelector('.riya-chat-header-avatar')) {
      const avatar = document.createElement('img');
      avatar.src = './assets/mascot-riya.svg';
      avatar.alt = `${ASSISTANT_NAME} emblem`;
      avatar.width = 36;
      avatar.height = 36;
      avatar.className = 'riya-chat-header-avatar';
      heading.prepend(avatar);

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'riya-chat-close-btn';
      closeBtn.setAttribute('aria-label', 'Close chat window');
      closeBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
      closeBtn.addEventListener('click', () => setChatWindowOpen(false));
      header.appendChild(closeBtn);
    }

    // 3. Stamp message arrival times
    root.querySelectorAll('.chat-message:not(.chat-message-typing)').forEach((msg) => {
      if (!msg.hasAttribute('data-time')) {
        msg.setAttribute('data-time', formatTime());
      }
    });

    syncLauncherState();
  } finally {
    isDecorating = false;
  }
}

function sendPromptToRiya(promptText) {
  if (!promptText) return;
  lastPromptSent = promptText;
  setChatWindowOpen(true);

  const attemptSend = (triesLeft = 15) => {
    const textarea = document.querySelector('#n8n-chat .chat-input textarea');
    const sendBtn = document.querySelector('#n8n-chat .chat-input-send-button');

    if (!textarea) {
      if (triesLeft > 0) {
        setTimeout(() => attemptSend(triesLeft - 1), 100);
      }
      return;
    }

    textarea.focus();
    textarea.value = promptText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    setTimeout(() => {
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
      } else {
        textarea.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
          })
        );
      }
    }, 80);
  };

  setTimeout(() => attemptSend(), 140);
}

function showChatErrorBanner(message) {
  const chatWindow = document.querySelector('#n8n-chat .chat-window');
  const header = document.querySelector('#n8n-chat .chat-header');
  if (!chatWindow || !header) return;

  let banner = chatWindow.querySelector('.riya-chat-alert');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'riya-chat-alert';
    banner.setAttribute('role', 'alert');
    header.insertAdjacentElement('afterend', banner);
  }

  banner.innerHTML = `
    <span>${message}</span>
    <button type="button" data-retry-riya>Retry</button>
  `;

  const retryBtn = banner.querySelector('[data-retry-riya]');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      banner.remove();
      if (lastPromptSent) {
        sendPromptToRiya(lastPromptSent);
      }
    });
  }
}

function clearChatErrorBanner() {
  const banner = document.querySelector('#n8n-chat .riya-chat-alert');
  if (banner) banner.remove();
}

function installFetchMonitor() {
  if (!window.fetch || window.__riyaFetchMonitored) return;
  window.__riyaFetchMonitored = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const isRiyaWebhook = url.includes('36a7ae43-365d-4cc8-b5bc-33d197384391');

    if (!isRiyaWebhook) {
      return nativeFetch(...args);
    }

    try {
      const response = await nativeFetch(...args);
      if (!response.ok) {
        showChatErrorBanner('Riya is taking a moment to respond. Please retry.');
      } else {
        clearChatErrorBanner();
      }
      return response;
    } catch (error) {
      showChatErrorBanner('Connection interrupted. Please check your network and retry.');
      throw error;
    }
  };
}

function bindWebsiteCtas() {
  document.querySelectorAll('[data-open-chat]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      setChatWindowOpen(true);
    });
  });

  document.querySelectorAll('[data-chat-prompt]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const prompt = btn.getAttribute('data-chat-prompt');
      if (prompt) {
        sendPromptToRiya(prompt);
      } else {
        setChatWindowOpen(true);
      }
    });
  });

  window.addEventListener('riya:open-and-send', (event) => {
    const message = event.detail?.message;
    if (message) {
      sendPromptToRiya(message);
    } else {
      setChatWindowOpen(true);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isChatWindowOpen()) {
      setChatWindowOpen(false);
    }
  });
}

function initRiyaChat() {
  installFetchMonitor();

  createChat({
    webhookUrl: WEBHOOK_URL,
    target: '#n8n-chat',
    mode: 'window',
    showWelcomeScreen: false,
    loadPreviousSession: true,
    initialMessages: [INITIAL_GREETING],
    i18n: {
      en: {
        title: `Chat with ${ASSISTANT_NAME}`,
        subtitle: 'Smile Dental Clinic, Pune',
        footer: '',
        getStarted: 'Start Conversation',
        inputPlaceholder: 'Ask a question or share a preferred visit time...',
        closeButtonTooltip: 'Minimize chat',
      },
    },
  });

  const root = document.getElementById('n8n-chat');
  if (root) {
    const observer = new MutationObserver(() => {
      decorateFloatingWidget();
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  }

  setTimeout(decorateFloatingWidget, 60);
  bindWebsiteCtas();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRiyaChat);
} else {
  initRiyaChat();
}
