# Contact and booking security

## Changes and processing
Both POST routes use form-security.ts, form-validation.ts, turnstile.ts and form-abuse-store.ts. Frontend forms include separate widget actions, an inaccessible hidden honeypot and a mount timestamp. Turnstile reset/timeout clears stale tokens. Models validate stored values; the admin booking update can only change read status, matching its existing UI. Email HTML escapes user text.

JSON payloads are bounded to 16 KiB while streaming. Honeypot and optional timing checks precede a bounded, per-instance attempt limiter. Fields are trimmed and type checked. Siteverify requires success=true, the correct action, an allowed hostname and a fresh challenge timestamp; it times out after 8 seconds and fails closed on every error, including missing configuration. Only then are shared MongoDB counters/duplicate claims written, followed by the business record and emails. MongoDB errors fail closed. No record or email is processed without security checks passing.

Limits: contact 5 attempts per 10 minutes; booking 8. Local attempts include invalid CAPTCHA requests. MongoDB tracks verified submissions across instances using atomic counters and a TTL index on form_abuse.expiresAt. Fixed shared windows may permit a burst around a window boundary. Without trusted client IP, the fallback is a shared 100 requests per form per 10 minutes. Configure a trusted proxy and edge limiting for production. Invalid-token attacks distributed across instances need edge protection; they deliberately do not cause database writes.

Duplicates are exact normalized payloads from the same source within 2 minutes, atomically claimed across instances. Changed booking details are permitted. Claims are released if processing fails; successful persistence with failed email retains the claim to avoid resending records. Email failures retain the existing save-and-success behavior and emit email_failed logs. There is no new transactional outbox or mail retry system.

Name 2?100 characters, email at most 254, phone 7?20 with at least 7 digits, optional subject at most 200, contact message 5?5000, optional booking notes at most 2000. Guests remain the existing 1?7 selector values; 7 means 7+. Dates must be real calendar dates from today in Europe/Sofia through 366 days ahead. The current form has no time selection; optional API time is validated as HH:mm and stored/emailed without making it required. No new opening-hour restrictions are imposed. The 366-day horizon is a new conservative policy and should be reviewed if longer advance bookings are intended.

## Environment
- NEXT_PUBLIC_TURNSTILE_SITE_KEY: public widget key (requires rebuild).
- TURNSTILE_SECRET_KEY: server-only matching secret. Missing configuration blocks both forms, including development.
- TURNSTILE_ALLOWED_HOSTNAMES: comma-separated exact names, defaults to ona.rest,www.ona.rest. Add localhost only in development or explicit staging hostnames in staging. Configure the same allowed domains in the Turnstile dashboard. Avoid production test keys.
- FORM_SECURITY_HASH_KEY: random server-only secret for HMAC anonymization; falls back to Turnstile secret. Keep stable across instances.
- FORM_TRUSTED_PROXY: blank by default. Set cloudflare only when the origin is inaccessible except through Cloudflare (firewall/tunnel/authenticated origin protection). Set vercel only for requests received through Vercel's platform, which owns x-vercel-forwarded-for. cf-connecting-ip, x-forwarded-for and x-real-ip are otherwise ignored. A header claiming Cloudflare is not proof of proxy trust. Cloudflare in front of Vercel needs verified origin protection before using the Cloudflare mode; otherwise use Vercel mode and accept proxy egress grouping.
- Existing MONGODB_URI, GMAIL_USER and GMAIL_APP_PASSWORD remain required. MongoDB credentials need permission to create the TTL index and update form_abuse.

The local .env.example contained a credential and was sanitized. It is ignored by the repository, so all required deployment settings are also documented here. Rotate the exposed credential; sanitizing a file does not revoke it.

## Manual Cloudflare configuration
No infrastructure-as-code or proven proxy deployment was found. Ensure DNS proxying and lock down direct origin access before trusting Cloudflare IP headers.

Use the following exact base expression:

(http.host in {"ona.rest" "www.ona.rest"} and http.request.uri.path in {"/api/contact" "/api/booking"})

WAF custom rule: append 'and http.request.method ne "POST"', action Block. These same-origin JSON endpoints do not require cross-origin OPTIONS.

Create two separate IP-based rate limiting rules:
- (http.host in {"ona.rest" "www.ona.rest"} and http.request.uri.path eq "/api/contact" and http.request.method eq "POST"): 10 requests / 60 seconds, Block for 60 seconds, custom HTTP 429 where supported.
- (http.host in {"ona.rest" "www.ona.rest"} and http.request.uri.path eq "/api/booking" and http.request.method eq "POST"): 15 requests / 60 seconds, Block for 60 seconds, custom HTTP 429 where supported.

Use available equivalent windows if your plan constrains them. Enable managed WAF rules. If Bot Management scores are available, start a logging rule using the base expression plus 'and http.request.method eq "POST" and cf.bot_management.score eq 1 and not cf.bot_management.verified_bot', then Block after observing legitimate traffic. Do not issue interactive challenge HTML on fetch API POSTs; it breaks the JSON flow. Review broad Bot Fight settings against both forms before enabling. These rules supplement mandatory origin Siteverify.

References: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ ; https://developers.cloudflare.com/waf/rate-limiting-rules/ ; https://developers.cloudflare.com/waf/custom-rules/use-cases/challenge-bad-bots/

## Verification and logs
Run npm test, npm run typecheck, npm run lint. Tests mock Siteverify; they do not contact Cloudflare or MongoDB. They exercise the exact shared submission gate used by both routes, with persistence callbacks asserting security failures never process a submission. Shared MongoDB claims still need a staging smoke test against your database/proxy configuration.

In staging/production, submit one real contact and booking with different details: expect HTTP 200, one record and the existing owner/customer emails. Logs must show turnstile success=true with the expected hostname/action, followed by accepted. A missing, forged, expired or reused token must yield 400 and no record/email. A contact token on booking must fail. Use fresh solved tokens when probing duplicates or shared rate limits; reused tokens are rejected by Cloudflare first. Compare records before/after negative probes. Ensure 1970-05-31 is rejected. Inspect Cloudflare Turnstile analytics alongside server logs.

Structured form_submission logs include timestamp, form, HMAC source, bounded user agent, category, verified hostname/action/challengeTs/errorCodes; no token, secret or form fields. verification indicates a failed origin check, validation indicates bad fields, rate_limit indicates throttling, duplicate indicates replayed content, and turnstile success=true followed by accepted means the submission obtained a valid token. Future spam with that sequence was not a CAPTCHA bypass; it passed Cloudflare and requires tuning additional abuse signals. Restrict log access/retention and review user-agent logging under your privacy policy.
