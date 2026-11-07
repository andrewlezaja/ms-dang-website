# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static multi-page marketing site for Clear Thoughts Psychiatry Inc. (a psychiatric practice with offices in Fairfield, NJ and Warwick, NY, plus telehealth). Plain HTML/CSS/vanilla JS: no build step, no package manager, no framework, no tests. `.nojekyll` is present so it can be served as-is from GitHub Pages.

**Deploys:** Netlify is connected to this GitHub repo and auto-deploys every push to `main`, so a push is a release to the live site. (GitHub Pages is still enabled but is being retired.)

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

When checking pages with headless Chrome screenshots, `[data-reveal]` content stays faded because it never scrolls into view. Inject `[data-reveal]{opacity:1!important;transform:none!important}` to see it. Headless Chrome also won't go below a 500px viewport, so narrower window sizes misrepresent mobile layout.

## Architecture

- **No templating layer.** The header, footer, and crisis strip are copy-pasted into every top-level `.html` file, between comments like `<!-- ================= HEADER ================= -->`. Any change to shared chrome (nav links, phone numbers, footer text, crisis resources) must be applied to every page, including `404.html` and `privacy.html`.
- **`css/styles.css`** is the whole design system in one file. Design tokens (colors, fonts, radii, shadows, layout) are CSS custom properties on `:root` at the top; reskinning is done there (`--bronze`, `--teal-800`). Fonts are DM Sans (headings) and Mulish (body) from Google Fonts.
- **`js/main.js`** is one IIFE of progressive enhancements. Every page must stay usable with JS disabled. It handles:
  - mobile nav (`.nav-toggle` / `.nav`, breakpoint 981px)
  - FAQ accordion (`.acc-btn` with `aria-controls`; a URL hash matching an `.acc-item` id opens that item)
  - scroll reveal (`[data-reveal]`, optional `data-reveal-delay`; skipped under `prefers-reduced-motion`)
  - footer year (`[data-year]`)
  - the `#appointment-form` on `contact.html`. It validates client-side, uses the `_gotcha` honeypot, and POSTs `FormData` via fetch to the form's `action`. While `action` still contains `REPLACE_WITH`, it shows a "call us instead" message instead of submitting.
- **SEO metadata is per page.** Each page has its own title, meta description, canonical URL, and Open Graph tags. Some pages also carry JSON-LD (`MedicalBusiness`, `Person`, `FAQPage` in `faq.html`). If you edit FAQ text, update the matching `FAQPage` JSON-LD in `faq.html` so they stay in sync.
- **Placeholder domain.** `https://www.clearthoughtspsychiatry.com` is hard-coded in canonical/OG/JSON-LD tags, `robots.txt`, and `sitemap.xml`. When you add a page, also add it to `sitemap.xml`.

## Content constraints

- **Phone numbers are duplicated** across pages and inside `js/main.js` status messages: Fairfield 551-250-3868 (fax 551-202-7409), Warwick 845-545-5444 (fax 845-213-4794). Update all of them together.
- **The crisis strip** (911, 988, Crisis Text Line, Bergen County 262-HELP) is required on every page. Do not remove it.
- **The appointment form collects contact details only.** It is not HIPAA-compliant. Do not add fields that collect clinical or health information.
- **Insurance positioning is in-network**, with self-pay as a secondary option. The two places that must agree are `insurance.html` (`#plans`) and `faq.html` (the `#insurance` accordion item).
- **The full carrier list lives in `insurance.html#plans`** (Home shows the same names as a logo strip). The FAQ names only a few carriers and links to the full list.
- **The first-visit checklist (what to bring) lives only in `faq.html#first-visit`.** Locations links to it. The "what happens next" steps live only on `contact.html`, and the care process steps only on `about.html`.
- **The full conditions list lives only in `services.html#conditions`** (a card beside Psychiatric Evaluations). Other pages link to it rather than repeating it. The provider page's "Areas of Clinical Focus" is a separate, shorter list.
- **Use "Perinatal / Postpartum Mood Disorders"**, not "Postpartum Depression", in condition lists.

## Pre-launch TODOs (tracked in README.md)

- Form endpoint: `REPLACE_WITH_FORM_ENDPOINT` in `contact.html`.
- Practice email: search `TODO: Add the practice email`.
- `office.svg` and `telehealth.svg` in `images/` are unused placeholders. Keep `favicon.svg`. The real photos are `provider.jpg`, `home-forest.jpg` (Home hero background via `.hero--photo`), `about-stones.jpg`, and `telehealth.jpg` (Services and Locations; landscape, shown in a 4:3 `.split__frame--landscape` with `object-position`).
- Provider profile links: `REPLACE_WITH_PSYCHOLOGY_TODAY_URL` and `REPLACE_WITH_HEADWAY_URL` in `provider.html`.
- Real domain to be set.
- `privacy.html` needs `[EFFECTIVE DATE]` filled in and legal review.
