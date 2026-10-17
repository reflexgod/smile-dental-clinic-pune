# Smile Dental Clinic, Pune — Demo Website

A production-quality demo website for a fictional dental clinic (**Smile Dental Clinic, Pune**), built to showcase a modern dental clinic brand paired with **Riya**, an interactive 24/7 AI receptionist powered by `@n8n/chat`.

> **Demo disclosure:** Smile Dental Clinic, Pune is a fictional clinic concept created for portfolio and live demonstration purposes. It is not an operating dental practice and does not provide medical advice or clinical services.

---

## Live Demo

- **GitHub Pages URL:** `https://reflexgod.github.io/smile-dental-clinic-pune/`

---

## Features

- **Interactive n8n AI Receptionist ("Riya"):**
  - Uses the official `@n8n/chat` widget (`v1.42.6`, self-hosted in `assets/vendor/n8n-chat/` for fast, reliable loading without third-party script blocking).
  - Connected to the live n8n Chat Trigger webhook:
    `https://viraaj19.app.n8n.cloud/webhook/36a7ae43-365d-4cc8-b5bc-33d197384391/chat`
  - Custom navy/teal theme matching the website, keyboard & screen-reader accessible launcher, and smart CTAs across the page that open Riya or prefill context-specific enquiries.
  - Appointment request form that validates inputs and hands structured request details directly to Riya in the chat window.
- **Editorial Dental Brand Design:**
  - Deep navy, clinical teal, and warm sand palette with `Fraunces` + `Manrope` typography.
  - Responsive WebP imagery (`srcset` + `sizes`), custom SVG iconography, subtle reveal animations (`prefers-reduced-motion` aware), and zero fabricated credentials, doctors, reviews, or phone numbers.

---

## Project Structure

```text
smile-dental-clinic-pune/
├── index.html                        # Main single-page application markup
├── 404.html                          # Custom 404 page for GitHub Pages
├── robots.txt                        # Search crawler rules
├── sitemap.xml                       # XML sitemap
├── .nojekyll                         # Bypasses Jekyll on GitHub Pages
├── .github/workflows/deploy.yml      # GitHub Actions workflow for GitHub Pages
├── assets/
│   ├── favicon.svg                   # Tooth brand mark favicon
│   ├── css/styles.css                # Complete stylesheet & @n8n/chat theme variables
│   ├── js/
│   │   ├── early.js                  # Pre-paint reveal guard
│   │   ├── main.js                   # Nav, scroll-spy, FAQ accordion, form & CTA handlers
│   │   └── chat.js                   # @n8n/chat initialization, a11y & programmatic API
│   ├── images/                       # Optimised responsive WebP images + OG image
│   └── vendor/n8n-chat/              # Self-hosted official @n8n/chat v1.42.6 bundle & CSS
└── scripts/
    ├── check-site.mjs                # Static link, asset & config verifier
    └── optimize-images.py            # Reproducible WebP & OG image generator
```

---

## Local Development & Verification

Run the static verification script:

```bash
node scripts/check-site.mjs
```

Preview locally with any static file server:

```bash
npx serve .
```

---

## n8n CORS Configuration

In your n8n workflow's **Chat Trigger** node, ensure **Allowed Origins (CORS)** includes:

- `https://reflexgod.github.io` (for the live GitHub Pages site)
- `http://localhost:3000` or `*` (if testing locally)
