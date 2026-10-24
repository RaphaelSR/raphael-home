# Raphael Rocha — homepage

Personal homepage at https://raphaelrocha.com. The professional portfolio remains at https://portfolio.raphaelrocha.com. ModPro is presented as a product built with its team, separately from independent projects.

## Development

Node 22.22.2 or newer. Run `npm ci`, `npm run dev` (localhost:3025), `npm run build` and `npm run preview`.

`npm run lint`, `npm run format:check` and `npm test` validate the project. Install the test browsers with `npx playwright install chromium webkit`. Tests run against the production build on port 3026; use `SITE_URL=https://raphaelrocha.com npm test` to check production.

## Implementation

React and Vite, system fonts, no third-party embeds or backend. Optional Google Analytics collection starts only after consent; the owner-only admin reads GA4 directly using an in-memory Google OAuth token. Portuguese, English and Spanish use browser preferences with an English fallback. Theme follows the system unless manually selected; preferences remain usable if storage is unavailable. Essential navigation also works without JavaScript.

The header owns its scroll state so scrolling does not rerender the page content. Motion respects reduced-motion settings. Links to external projects are explicit HTTPS destinations. Public GitHub and LinkedIn profiles and a personal email address are available as contact links. Personal phone numbers and WhatsApp links are omitted.

The production content policy limits scripts to the same origin and blocks network API calls, frames, plugins and forms. Inline styles are permitted for the scroll indicator. GitHub Pages serves static assets; application security does not depend on a client-side secret. Do not commit credentials or environment files.

## Publication

GitHub Actions validates formatting, lint, build, dependency audit and Chromium/WebKit browser tests before deploying main. Action versions are pinned to commit hashes. Pull requests validate without deploy permissions. The main branch is protected, with owner/admin bypass retained by request.

`public/CNAME` binds the homepage to raphaelrocha.com. DNS and redirects are managed in Cloudflare. Subdomains remain attached to their existing repositories. Legacy /pt/, /en/ and /es/ URLs lead to the professional portfolio.

A release can be rolled back by reverting its commit and rerunning the deployment workflow. Accessibility automation covers common WCAG 2.2 A/AA checks, multiple widths, themes and languages, keyboard navigation and reduced motion. It is not a substitute for a full assistive-technology audit, nor is a dependency audit a guarantee against unknown vulnerabilities.

## Search and sharing

The production build prerenders the complete React page in English, Portuguese and
Spanish. Canonical language URLs live at `/home/en/`, `/home/pt/` and `/home/es/`.
The root provides an English fallback and selects the visitor's saved/browser
language after hydration. Explicit language URLs take precedence over preferences.
The older `/en/`, `/pt/` and `/es/` routes still redirect to the portfolio.

`src/seo.js` supplies localized titles, descriptions, canonical URLs and structured
data. The sitemap lists the canonical pages; visible footer links and `hreflang`
connect all translations. `public/social-card.png` is a local 1200×630 sharing image.
SEO tests cover HTML without JavaScript, language history and legacy routes.
Search Console indexing and ranking require separate observation after publication.

## Owner analytics dashboard

`/admin/` uses Google sign-in and `analytics.readonly`; tokens and reports remain in memory and are cleared on sign-out/expiry. `src/admin/config.js` lists the permitted properties and domains. Each project row opens its own report, with pages (without query strings), events, device categories and a hostname breakdown in addition to daily views, users, sessions, countries and channels.

The principal overview reads GA4 property `555394741` for the original site network. Its `cantinho.raphaelrocha.com` entry is explicitly historical. Lotcraft production reads property `557114748`, documented in the Lotcraft repository's `docs/analytics.md`, for `lotcraft.app`, `www.lotcraft.app` and the two legacy Cantinho production hostnames. Development/preview hosts are excluded. These are different properties: historical and current totals are displayed separately, never added or presented as unique cross-property users. The dashboard shows its source and hostname coverage. Missing permissions/API failures display an error, not invented zero counts. Confirm current data and property access with the owner account after publication.

The public homepage displays Lotcraft and links to `https://lotcraft.app`; its stable internal content key remains `cantinho` to preserve translations. The parent site's `public/analytics.js` collector is not installed on Lotcraft; Lotcraft owns its consent and tracking, so this change does not add duplicate tracking or broaden consent.

Rockit Solutions production reads its own GA4 property `560170762`, restricted to `rockitsolutions.com.br` and `www.rockitsolutions.com.br`. It is available in the project selector and the source shortcuts, and is excluded from the principal overview totals. Its collector and consent are owned by the Rockit website. Contact events are clicks only: `contact_whatsapp_click`, `contact_phone_click`, and `contact_email_click`; they do not confirm a message or sale.
