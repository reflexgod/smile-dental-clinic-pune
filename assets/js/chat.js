/**
 * Riya — AI Receptionist for Dental Clinics
 * Uses the official @n8n/chat widget connected to the live n8n webhook,
 * enhanced with message timestamps, connection/slow-response feedback,
 * in-stream starter enquiries, and session reset.
 */
import { createChat } from '../vendor/n8n-chat/n8n-chat.js';

export const WEBHOOK_URL =
  'https://viraaj19.app.n8n.cloud/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat';

const headerControls = document.querySelector('[data-header-controls]');
const statusBadge = document.querySelector('[data-connection-status]');
const statusLabel = document.querySelector('[data-connection-label]');
const networkBanner = document.querySelector('[data-network-banner]');
const networkMessage = document.querySelector('[data-network-message]');
const networkDismiss = document.querySelector('[data-network-dismiss]');
const quickPrompts = document.querySelector('[data-quick-prompts]');
const resetBtn = document.querySelector('[data-reset-chat]');

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function setConnectionState(state, labelText) {
  if (!statusBadge || !statusLabel) return;
  statusBadge.dataset.state = state;
  statusLabel.textContent = labelText;
}

function showErrorBanner(msg) {
  if (!networkBanner || !networkMessage) return;
  networkMessage.textContent = msg;
  networkBanner.hidden = false;
  setConnectionState('error', 'Connection issue');
}

function hideErrorBanner() {
  if (!networkBanner) return;
  networkBanner.hidden = true;
  setConnectionState('online', 'Online');
}

networkDismiss?.addEventListener('click', hideErrorBanner);

// Monitor webhook requests to surface loading, slow-response, and error states cleanly
const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input?.url || '';
  const isWebhook = url.includes('/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat');

  if (!isWebhook) {
    return nativeFetch(input, init);
  }

  hideErrorBanner();
  setConnectionState('busy', 'Replying…');
  const slowTimer = setTimeout(() => {
    setConnectionState('busy', 'Working…');
  }, 3500);

  try {
    const response = await nativeFetch(input, init);
    clearTimeout(slowTimer);
    if (!response.ok) {
      showErrorBanner(`The clinic assistant returned an error (HTTP ${response.status}). Please try again.`);
    } else {
      setConnectionState('online', 'Online');
    }
    return response;
  } catch (err) {
    clearTimeout(slowTimer);
    showErrorBanner(
      'Could not reach Riya. Please check your internet connection or verify that this domain is allowed in n8n CORS.'
    );
    throw err;
  }
};

function enhanceStream(mount) {
  const header = mount.querySelector('.chat-header');
  if (header && headerControls && headerControls.parentElement !== header) {
    header.appendChild(headerControls);
  }
  const textarea = mount.querySelector('.chat-inputs textarea');
  if (textarea && textarea.getAttribute('rows') !== '1') {
    textarea.setAttribute('rows', '1');
  }

  const list = mount.querySelector('.chat-messages-list');
  if (!list) return;

  // Place starter prompts below Riya's opening message until the user sends a message
  const hasUserMessage = !!list.querySelector('.chat-message-from-user');
  if (quickPrompts) {
    if (hasUserMessage) {
      quickPrompts.hidden = true;
    } else if (quickPrompts.parentElement !== list) {
      list.appendChild(quickPrompts);
    }
  }

  const messages = list.querySelectorAll('.chat-message:not([data-meta])');
  messages.forEach((msg) => {
    if (msg.classList.contains('chat-message-typing')) return;
    const isUser = msg.classList.contains('chat-message-from-user');
    msg.setAttribute('data-meta', `${isUser ? 'You' : 'Riya'} · ${formatTime()}`);
  });

  const typing = list.querySelector('.chat-message-typing');
  if (typing && !typing.hasAttribute('data-meta')) {
    typing.setAttribute('data-meta', 'Riya is typing…');
  }
}

function mountWidget() {
  const mount = document.getElementById('n8n-chat');
  if (!mount) return;
  const panel = document.querySelector('.panel');
  if (headerControls && headerControls.parentElement) {
    panel?.appendChild(headerControls);
  }
  if (quickPrompts && quickPrompts.parentElement) {
    panel?.appendChild(quickPrompts);
  }
  mount.innerHTML = '';

  createChat({
    webhookUrl: WEBHOOK_URL,
    webhookConfig: {
      method: 'POST',
      headers: {},
    },
    target: '#n8n-chat',
    mode: 'fullscreen',
    showWelcomeScreen: false,
    loadPreviousSession: false,
    enableStreaming: false,
    chatInputKey: 'chatInput',
    chatSessionKey: 'sessionId',
    defaultLanguage: 'en',
    initialMessages: ['Hi! I’m Riya, your dental clinic assistant. How can I help you today?'],
    i18n: {
      en: {
        title: 'Riya',
        subtitle: '',
        footer: '',
        getStarted: 'New Conversation',
        inputPlaceholder: 'Message Riya…',
        closeButtonTooltip: 'Close chat',
      },
    },
  });

  const observer = new MutationObserver(() => {
    enhanceStream(mount);
    const heading = mount.querySelector('.chat-header h1');
    if (heading && heading.getAttribute('aria-level') !== '2') {
      heading.setAttribute('role', 'heading');
      heading.setAttribute('aria-level', '2');
    }
    const textarea = mount.querySelector('.chat-inputs textarea');
    if (textarea && textarea.getAttribute('rows') !== '1') {
      textarea.setAttribute('rows', '1');
    }
  });

  observer.observe(mount, { childList: true, subtree: true });
  requestAnimationFrame(() => enhanceStream(mount));
}

function sendPrompt(text) {
  const textarea = document.querySelector('#n8n-chat .chat-inputs textarea');
  if (!textarea) return;
  textarea.value = text;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const sendBtn = document.querySelector('#n8n-chat .chat-input-send-button');
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
      }
      textarea.focus();
    });
  });
}

quickPrompts?.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-prompt]');
  if (!chip) return;
  sendPrompt(chip.dataset.prompt);
});

resetBtn?.addEventListener('click', () => {
  hideErrorBanner();
  if (quickPrompts) quickPrompts.hidden = false;
  mountWidget();
});

mountWidget();
