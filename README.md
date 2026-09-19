# Raphael Rocha — homepage

Personal homepage at https://raphaelrocha.com. The professional portfolio remains at https://portfolio.raphaelrocha.com. ModPro is presented as a product built with its team, separately from independent projects.

## Development

Node 22.22.2 or newer. Run `npm ci`, `npm run dev` (localhost:3025), `npm run build` and `npm run preview`.

`npm run lint`, `npm run format:check` and `npm test` validate the project. Install the test browsers with `npx playwright install chromium webkit`. Tests run against the production build on port 3026; use `SITE_URL=https://raphaelrocha.com npm test` to check production.

## Implementation

React and Vite, system fonts, no third-party embeds, analytics, backend or runtime API calls. Portuguese, English and Spanish use browser preferences with an English fallback. Theme follows the system unless manually selected; preferences remain usable if storage is unavailable. Essential navigation also works without JavaScript.

The header owns its scroll state so scrolling does not rerender the page content. Motion respects reduced-motion settings. Links to external projects are explicit HTTPS destinations. Discord copies the public username and reports clipboard errors accessibly.

The production content policy limits scripts to the same origin and blocks network API calls, frames, plugins and forms. Inline styles are permitted for the scroll indicator. GitHub Pages serves static assets; application security does not depend on a client-side secret. Do not commit credentials or environment files.

## Publication

GitHub Actions validates formatting, lint, build, dependency audit and Chromium/WebKit browser tests before deploying main. Action versions are pinned to commit hashes. Pull requests validate without deploy permissions. The main branch is protected, with owner/admin bypass retained by request.

`public/CNAME` binds the homepage to raphaelrocha.com. DNS and redirects are managed in Cloudflare. Subdomains remain attached to their existing repositories. Legacy /pt/, /en/ and /es/ URLs lead to the professional portfolio.

A release can be rolled back by reverting its commit and rerunning the deployment workflow. Accessibility automation covers common WCAG 2.2 A/AA checks, multiple widths, themes and languages, keyboard navigation and reduced motion. It is not a substitute for a full assistive-technology audit, nor is a dependency audit a guarantee against unknown vulnerabilities.
