/**
 * Smile Dental Clinic, Pune - Primary Website Interactions
 * Handles mobile menu drawer, treatment service pre-selection, FAQ accordion,
 * and appointment request form confirmation + handoff to Riya.
 */

function initMobileNavigation() {
  const toggleBtn = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggleBtn || !drawer) return;

  const closeDrawer = () => {
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.hidden = true;
  };

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    drawer.hidden = isExpanded;
  });

  drawer.querySelectorAll('a, [data-open-chat]').forEach((el) => {
    el.addEventListener('click', () => closeDrawer());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !drawer.hidden) {
      closeDrawer();
      toggleBtn.focus();
    }
  });
}

function initServiceSelectionLinks() {
  document.querySelectorAll('[data-select-service]').forEach((link) => {
    link.addEventListener('click', () => {
      const value = link.getAttribute('data-select-service');
      const selectEl = document.getElementById('patient-service');
      if (selectEl && value) {
        selectEl.value = value;
      }
    });
  });
}

function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;

      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (panel) {
        panel.hidden = isExpanded;
      }
    });
  });
}

function initAppointmentRequestForm() {
  const form = document.getElementById('appointment-request-form');
  const errorEl = document.getElementById('form-error');
  const confirmEl = document.getElementById('form-confirmation');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const service = String(formData.get('service') || 'General Checkup & Teeth Cleaning').trim();
    const preferredWindow = String(formData.get('preferredWindow') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    if (!name || !phone) {
      if (errorEl) errorEl.hidden = false;
      if (confirmEl) confirmEl.hidden = true;
      const firstEmpty = !name
        ? document.getElementById('patient-name')
        : document.getElementById('patient-phone');
      if (firstEmpty) firstEmpty.focus();
      return;
    }

    if (errorEl) errorEl.hidden = true;
    if (confirmEl) confirmEl.hidden = false;

    const parts = [
      `Hi Riya, I would like to request an appointment.`,
      `Name: ${name}`,
      `Contact: ${phone}`,
      `Treatment: ${service}`,
    ];
    if (preferredWindow) {
      parts.push(`Preferred time: ${preferredWindow}`);
    }
    if (notes) {
      parts.push(`Notes: ${notes}`);
    }

    const message = parts.join(' | ');
    window.dispatchEvent(
      new CustomEvent('riya:open-and-send', {
        detail: { message },
      })
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initServiceSelectionLinks();
  initFaqAccordion();
  initAppointmentRequestForm();
});
