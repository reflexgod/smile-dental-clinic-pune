import { loadChat, openChat, isOpen } from './chat.js';

document.documentElement.classList.add('js', 'app-ready');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ *
 * Header: shadow on scroll + mobile navigation
 * ------------------------------------------------------------------ */
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const mobileNav = window.matchMedia('(max-width: 1080px)');

function onScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function setMenu(open) {
  navMenu.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('is-locked', open);
  if (open) navMenu.querySelector('a')?.focus({ preventScroll: true });
}

navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('is-open')));

navMenu.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
    setMenu(false);
    navToggle.focus();
  }
});

mobileNav.addEventListener('change', (e) => {
  if (!e.matches) setMenu(false);
});

// Keep keyboard focus inside the open mobile menu
navMenu.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || !navMenu.classList.contains('is-open')) return;
  const focusables = [...navMenu.querySelectorAll('a, button'), navToggle];
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  }
});
navToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && !e.shiftKey && navMenu.classList.contains('is-open')) {
    e.preventDefault();
    navMenu.querySelector('a')?.focus();
  }
});

/* ------------------------------------------------------------------ *
 * Active nav link while scrolling
 * ------------------------------------------------------------------ */
const navLinks = [...document.querySelectorAll('.nav__link')];
const sectionMap = new Map(
  navLinks
    .map((link) => [document.querySelector(link.getAttribute('href')), link])
    .filter(([section]) => section)
);

if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((l) => {
          l.classList.remove('is-active');
          l.removeAttribute('aria-current');
        });
        const link = sectionMap.get(entry.target);
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'location');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sectionMap.forEach((_, section) => spy.observe(section));
}

/* ------------------------------------------------------------------ *
 * Reveal-on-scroll animations
 * ------------------------------------------------------------------ */
const reveals = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-visible'));
} else {
  // Stagger siblings slightly for a refined cascade.
  reveals.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 70}ms`);
  });
  const revealer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  reveals.forEach((el) => revealer.observe(el));
}

/* ------------------------------------------------------------------ *
 * FAQ accordion (one open at a time, animated, fully keyboard accessible)
 * ------------------------------------------------------------------ */
const accordion = document.querySelector('[data-accordion]');
if (accordion) {
  const triggers = [...accordion.querySelectorAll('.acc-trigger')];

  const setItem = (trigger, open) => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
    } else {
      panel.classList.remove('is-open');
      const hide = () => {
        if (trigger.getAttribute('aria-expanded') === 'false') panel.hidden = true;
      };
      if (prefersReducedMotion) hide();
      else panel.addEventListener('transitionend', hide, { once: true });
    }
  };

  // Initial state
  triggers.forEach((t) => {
    if (t.getAttribute('aria-expanded') === 'true') {
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = false;
      panel.classList.add('is-open');
    }
  });

  triggers.forEach((trigger, i) => {
    trigger.addEventListener('click', () => {
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      triggers.forEach((t) => t !== trigger && t.getAttribute('aria-expanded') === 'true' && setItem(t, false));
      setItem(trigger, willOpen);
    });
    trigger.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: triggers.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      triggers[(keys[e.key] + triggers.length) % triggers.length].focus();
    });
  });
}

/* ------------------------------------------------------------------ *
 * Chat CTAs  (data-chat="open" | "appointment" | "prefill")
 * ------------------------------------------------------------------ */
const APPOINTMENT_MESSAGE = "Hi Riya, I'd like to request an appointment.";
let appointmentRequested = false;

document.addEventListener('click', async (e) => {
  const cta = e.target.closest('[data-chat]');
  if (!cta) return;
  e.preventDefault();
  if (navMenu.classList.contains('is-open')) setMenu(false);

  const mode = cta.dataset.chat;
  cta.setAttribute('aria-busy', 'true');
  try {
    if (mode === 'appointment') {
      // Send the opener once; later clicks simply reopen the ongoing conversation.
      await openChat(appointmentRequested ? {} : { message: APPOINTMENT_MESSAGE, send: true });
      appointmentRequested = true;
    } else if (mode === 'prefill') {
      await openChat({ message: cta.dataset.chatMessage || '' });
    } else {
      await openChat();
    }
  } catch {
    // Widget could not load (offline / blocked). Fall back to the in-page form.
    if (cta.getAttribute('href')) {
      document.querySelector(cta.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    }
    showFormStatus('The chat could not be loaded right now. Please check your connection and try again.', true);
  } finally {
    cta.removeAttribute('aria-busy');
  }
});

/* ------------------------------------------------------------------ *
 * Appointment form → hands details to Riya in the chat
 * ------------------------------------------------------------------ */
const form = document.getElementById('appointment-form');
const formStatus = document.querySelector('[data-form-status]');

function showFormStatus(text, isError = false) {
  if (!formStatus) return;
  formStatus.textContent = text;
  formStatus.style.color = isError ? '#b23a0b' : '';
}

if (form) {
  const dateInput = form.elements.date;
  const today = new Date();
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = iso(today);
  const max = new Date(today);
  max.setMonth(max.getMonth() + 6);
  dateInput.max = iso(max);

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
    phone: (v) => {
      const digits = v.replace(/\D/g, '');
      const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.replace(/^0/, '');
      return /^[6-9]\d{9}$/.test(local) ? '' : 'Please enter a valid 10-digit mobile number.';
    },
    reason: (v) => (v ? '' : 'Please choose a reason for your visit.'),
  };

  const validateField = (name) => {
    const field = form.elements[name];
    const message = rules[name](field.value);
    const wrapper = field.closest('.field');
    const error = document.getElementById(`f-${name}-err`);
    wrapper.classList.toggle('has-error', !!message);
    field.setAttribute('aria-invalid', String(!!message));
    if (message) field.setAttribute('aria-describedby', error.id);
    else field.removeAttribute('aria-describedby');
    error.textContent = message;
    return !message;
  };

  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener('blur', () => field.value && validateField(name));
    field.addEventListener('input', () => field.closest('.field').classList.contains('has-error') && validateField(name));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      showFormStatus('');
      return;
    }

    const data = new FormData(form);
    const formattedDate = data.get('date')
      ? new Date(`${data.get('date')}T00:00:00`).toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : '';
    const preferred = [formattedDate, data.get('time') ? `${data.get('time').toLowerCase()}` : '']
      .filter(Boolean)
      .join(', ');

    const message = [
      "Hi Riya, I'd like to request an appointment.",
      `Name: ${data.get('name').trim()}`,
      `Phone: ${data.get('phone').trim()}`,
      `Reason: ${data.get('reason')}`,
      preferred ? `Preferred time: ${preferred}` : 'Preferred time: flexible',
    ].join('\n');

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    showFormStatus('Opening the chat with Riya…');
    try {
      await openChat({ message, send: true });
      showFormStatus('Sent to Riya — continue in the chat window. The clinic team will contact you to confirm a slot.');
      form.reset();
    } catch {
      showFormStatus('The chat could not be loaded right now. Please check your connection and try again.', true);
    } finally {
      submit.disabled = false;
    }
  });
}

/* ------------------------------------------------------------------ *
 * Load the chat widget once the page is idle (or on first intent)
 * ------------------------------------------------------------------ */
const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
const scheduleLoad = () => idle(() => loadChat().catch(() => {}), { timeout: 2500 });
if (document.readyState === 'complete') scheduleLoad();
else window.addEventListener('load', scheduleLoad, { once: true });

/* ------------------------------------------------------------------ *
 * Friendly teaser bubble beside the launcher (once per session)
 * ------------------------------------------------------------------ */
const teaser = document.querySelector('[data-chat-teaser]');
const TEASER_KEY = 'riya-teaser-dismissed';
const teaserDismissed = () => {
  try { return sessionStorage.getItem(TEASER_KEY) === '1'; } catch { return false; }
};
const dismissTeaser = () => {
  teaser.hidden = true;
  try { sessionStorage.setItem(TEASER_KEY, '1'); } catch { /* storage unavailable */ }
};

if (teaser) {
  document.addEventListener('riya:ready', () => {
    if (teaserDismissed()) return;
    setTimeout(() => {
      if (!isOpen() && !teaserDismissed()) teaser.hidden = false;
    }, 4000);
  });
  document.addEventListener('riya:toggle', (e) => {
    if (e.detail.open) dismissTeaser();
  });
  teaser.querySelector('[data-chat-teaser-close]').addEventListener('click', (e) => {
    e.stopPropagation();
    dismissTeaser();
  });
}

/* Footer year */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});
