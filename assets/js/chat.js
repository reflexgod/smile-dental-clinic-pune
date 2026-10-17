/**
 * Riya — AI Receptionist for Dental Clinics
 * Powered by the official @n8n/chat widget connected to the live n8n webhook.
 */
import { createChat } from '../vendor/n8n-chat/n8n-chat.js';

export const WEBHOOK_URL =
  'https://viraaj19.app.n8n.cloud/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat';

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
      subtitle: 'Dental Clinic Assistant · Online',
      footer: '',
      getStarted: 'New Conversation',
      inputPlaceholder: 'Ask a question or request an appointment…',
      closeButtonTooltip: 'Close chat',
    },
  },
});
