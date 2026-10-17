/**
 * Smile Dental Clinic, Pune — Primary UI Interactions
 * Handles mobile navigation, treatment discipline tabs, FAQ accordion,
 * and appointment request form handoff to Riya.
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

function initTreatmentTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-treatment-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-treatment-panel]'));
  if (!tabs.length || !panels.length) return;

  const activateTab = (targetKey, shouldFocus = false) => {
    tabs.forEach((tab) => {
      const isMatch = tab.getAttribute('data-treatment-tab') === targetKey;
      tab.classList.toggle('is-active', isMatch);
      tab.setAttribute('aria-selected', String(isMatch));
      tab.setAttribute('tabindex', isMatch ? '0' : '-1');
      if (isMatch && shouldFocus) {
        tab.focus();
      }
    });

    panels.forEach((panel) => {
      const isMatch = panel.getAttribute('data-treatment-panel') === targetKey;
      panel.classList.toggle('is-active', isMatch);
      panel.hidden = !isMatch;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateTab(tab.getAttribute('data-treatment-tab'), false);
    });

    tab.addEventListener('keydown', (event) => {
      let nextIndex = null;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        const nextKey = tabs[nextIndex].getAttribute('data-treatment-tab');
        activateTab(nextKey, true);
      }
    });
  });

  // Footer quick links to specific treatment tabs
  document.querySelectorAll('[data-trigger-tab]').forEach((link) => {
    link.addEventListener('click', () => {
      const key = link.getAttribute('data-trigger-tab');
      if (key) activateTab(key, false);
    });
  });

  // Pre-select treatment option in appointment form when clicking "Request [Service] Slot"
  document.querySelectorAll('[data-select-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const serviceValue = btn.getAttribute('data-select-service');
      const selectEl = document.getElementById('patient-service');
      if (selectEl && serviceValue) {
        selectEl.value = serviceValue;
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
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const service = String(formData.get('service') || 'General Checkup & Consultation').trim();
    const preferredWindow = String(formData.get('window') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    if (!name || !phone) {
      if (errorEl) errorEl.hidden = false;
      const firstEmpty = !name
        ? document.getElementById('patient-name')
        : document.getElementById('patient-phone');
      if (firstEmpty) firstEmpty.focus();
      return;
    }

    if (errorEl) errorEl.hidden = true;

    const parts = [
      `Hi Riya, I'd like to request an appointment at Smile Dental Clinic, Pune.`,
      `Name: ${name}`,
      `Phone: ${phone}`,
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
  initTreatmentTabs();
  initFaqAccordion();
  initAppointmentRequestForm();
});
