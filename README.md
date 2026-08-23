# Clear Thoughts Psychiatry Inc. — Website

Static multi-page marketing site. No build step, no dependencies, no framework.
Deploys anywhere that serves files: Netlify, Vercel, Cloudflare Pages, GitHub Pages, or
traditional cPanel/FTP hosting.

## Run locally

```bashhttp://[::]:8000/
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html        Home
about.html        About the practice — mission, approach, care process, why choose
provider.html     Meet Rupinder "Rupi" Kaur, MSN, PMHNP-BC
services.html     Six services in depth + conditions + what to expect
locations.html    Fairfield NJ, Warwick NY, telepsychiatry, service areas
insurance.html    In-network plans, verification, out-of-network, self-pay, cancellation
faq.html          Accordion FAQ (with FAQPage structured data)
contact.html      Appointment request form + office details
privacy.html      Website privacy policy (needs legal review — see below)
404.html          Not-found page
css/styles.css    Entire design system, single file
js/main.js        Nav, accordion, scroll reveal, form handling
images/           SVG placeholders — replace with real photography
robots.txt        Update domain before launch
sitemap.xml       Update domain and dates before launch
```

There is no templating layer, so the header, footer, and crisis strip are duplicated
in each HTML file. **If you change one, change all of them.** They are delimited by
`<!-- ================= HEADER ================= -->` style comments.

---

## Before launch — required

### 1. Connect the appointment form

`contact.html` line with `action="REPLACE_WITH_FORM_ENDPOINT"`. Until this is set, the
form validates but shows visitors a message telling them to call instead — it never
silently drops a submission.

**Formspree** (easiest, no server):
```html
<form id="appointment-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" novalidate>
```

**Netlify Forms** (if hosting on Netlify) — add two attributes and remove the JS
dependency by deleting the `action`:
```html
<form id="appointment-form" name="appointment" method="POST" data-netlify="true" novalidate>
  <input type="hidden" name="form-name" value="appointment">
```

A honeypot field (`_gotcha`) is already in place for spam. Formspree and Netlify both
recognize this convention.

> **HIPAA note:** the form deliberately collects only contact details and warns visitors
> not to send health information. Standard Formspree/Netlify Forms are **not** HIPAA
> business associates. If the practice ever wants patients to submit clinical details
> through the site, that must move to a HIPAA-compliant intake platform under a BAA
> (SimplePractice, Luminello, IntakeQ, Jotform HIPAA, etc.).

### 2. Fill in the missing email address

The client's brief left the Fairfield email blank. There is a commented-out email row in
`contact.html` (search for `TODO: Add the practice email`) and the footer omits email
entirely. Add the real address in both places once confirmed.

### 3. Replace the placeholder images

`images/` contains four SVG placeholders that render as tasteful abstract art so the site
looks finished today. Swap them for real photography:

| File | Used on | Suggested shot |
|---|---|---|
| `provider.svg` | Home hero, Home provider section, Provider page | Professional headshot of Rupi, portrait 4:5 |
| `office.svg` | Home, About, Services | Waiting room or consultation room |
| `telehealth.svg` | Services, Locations | Warm lifestyle shot suggesting a video visit |
| `favicon.svg` | Browser tab | Keep — it's the real logo mark |

Update the `src` in each HTML file (e.g. `images/provider.svg` → `images/provider.jpg`).
Target 4:5 portrait ratio, ~1200×1500px, compressed to under 250KB each.

### 4. Set the real domain

Search and replace `https://www.clearthoughtspsychiatry.com` across all `.html` files,
`robots.txt`, and `sitemap.xml`. It appears in `<link rel="canonical">`, Open Graph tags,
and the JSON-LD structured data.

### 5. Legal review

- `privacy.html` is a **draft** written from the practice's stated practices. It is not
  legal advice. Have the practice's attorney or compliance advisor review it.
- The `#hipaa` section is a placeholder pointing at the practice's Notice of Privacy
  Practices. Replace it with the real NPP text or link to a PDF.
- Fill in `[EFFECTIVE DATE]` at the top of the page.

---

## Content decisions made during the build

**Insurance conflict resolved toward in-network.** The source content contradicted
itself: the Insurance & Fees page listed twelve in-network carriers, while the FAQ said
"at this time, our services are self-pay." Per your direction, the site presents the
practice as **in-network** with the listed plans, with self-pay available as a secondary
option. The FAQ answer was rewritten to match. If the client says otherwise, the two
places to edit are `insurance.html` (`#plans` section) and `faq.html` (`#insurance`
accordion item).

**"Conditions We Commonly Treat" de-duplicated.** The brief listed it twice; per the
client's correction the duplicate now reads **Perinatal / Postpartum Mood Disorders**,
which replaced the standalone "Postpartum Depression" entry across all pages.

**FAQ blanks filled.** "Do you see patients in person? Yes, I offer in-person appointments
at ___" now names both offices. That answer also said telehealth was available "across New
Jersey" only; every other section of the brief says New Jersey *and* New York, so the site
says both. **Worth confirming with the client** that NY telehealth is active.

**Plan list date.** `insurance.html` displays "Current participating plans as of April 28,
2026" exactly as supplied. Today is later than that — confirm the list is still accurate
before launch.

**Crisis resources are on every page.** A standing crisis strip above the footer lists 911,
988, the Crisis Text Line, and Bergen County 262-HELP. This is standard practice for a
psychiatry site and should not be removed. Note the Bergen County line is county-specific
— you may want to add an Orange County, NY equivalent for the Warwick patients.

---

## Design notes

Styling follows the reference site (lifepsyc.com): DM Sans headings, Mulish body, warm
bronze accent over deep teal. All tokens live at the top of `css/styles.css` under
`:root` — change `--bronze` and `--teal-800` to reskin the whole site.

Accessibility: skip link, visible focus rings, `aria-current` on nav, labelled form
fields with inline errors, `aria-live` status region, `prefers-reduced-motion` respected,
semantic landmarks throughout.

SEO: unique title and meta description per page, canonical URLs, Open Graph tags,
`MedicalBusiness` + `Person` + `FAQPage` JSON-LD, sitemap, and robots.txt.
