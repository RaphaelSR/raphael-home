# Personal analytics

Collection uses one GA4 web stream (G-9F41PKY1G5) linked to the Firebase Spark project raphael-rocha-analytics. No billing, database, service-account credentials, Cloud Functions or private API key are required.

## Access boundary

/admin/ is a public static login screen; report data is not embedded in its HTML or bundle. Google authorizes each Analytics Data API request using an in-memory OAuth access token. The GA property (555394741) must remain accessible only to the owner, raphaelrochabcc@gmail.com, and the Firebase project must have no additional human members. Keep the OAuth consent app in testing with the owner as the only test user and https://raphaelrocha.com as the only JavaScript origin. The client-side email check is defense in depth, not the authorization boundary.

The OAuth client ID, measurement ID and property ID are public identifiers. Never commit a client secret, access/refresh token or service-account JSON. No client secret is used by this application. Tokens expire, are removed on logout/reload, and are never written to cookies or browser storage. The requested scopes are openid, email and analytics.readonly.

## Collection

public/analytics.js is shared by the eight explicitly allowed hosts. It loads Google's tag only after opt-in, respects Do Not Track, excludes /admin, and ignores development/unknown hosts. Consent is stored in a six-month Secure SameSite=Lax cookie on .raphaelrocha.com. The privacy button allows withdrawal; collection is disabled and Analytics cookies are removed.

Page URLs are restricted to public language paths (all other paths become /). Query strings, hashes, page titles, form content and referrer paths are not sent. Keep GA enhanced measurement, Google signals and advertising integrations disabled. Statistics are estimates, exclude users declining consent or blocking scripts, and may take 24–48 hours to settle. There is no historical backfill before deployment.

## Operations

To add a site, extend both host allowlists (tracker and admin config) and install the shared script after publishing the updated main site. Preserve each project's existing game data/authentication services.

Use npm run lint, npm run build and npm test. e2e/admin-auth.spec.js uses only fake tokens and mocked Google responses to exercise owner checks, API denial, logout and expiry; a real production login is also required after OAuth configuration changes. Never save real login traces or authenticated API payloads in the public repository.
