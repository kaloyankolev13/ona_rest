import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { secureSubmission, SubmissionError, resetFormSecurityForTests } from "../src/lib/form-security";
import { verifyTurnstile, getRemoteIp } from "../src/lib/turnstile";
import { validBookingDate } from "../src/lib/form-validation";
import Booking from "../src/models/Booking";
const originalFetch = global.fetch;
const contact = { name: "Test User", email: "test@example.com", subject: "Question", message: "A normal question", captchaToken: "token", website: "", formStartedAt: Date.now() - 5000 };
const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const booking = { ...contact, phone: "+359888123456", date, guests: 7, notes: "", time: "" };
let response: unknown; let status = 200; let throws = false; let saves = 0;
beforeEach(() => {
 resetFormSecurityForTests(); saves = 0; status = 200; throws = false;
 process.env.TURNSTILE_SECRET_KEY = "test-secret"; process.env.TURNSTILE_ALLOWED_HOSTNAMES = "ona.rest"; process.env.FORM_TRUSTED_PROXY = "cloudflare";
 response = { success: true, hostname: "ona.rest", action: "contact", challenge_ts: new Date().toISOString() };
 global.fetch = async () => { if (throws) throw new DOMException("Timed out", "TimeoutError"); return new Response(JSON.stringify(response), { status }); };
});
test.after(() => { global.fetch = originalFetch; });
function submit(form: "contact" | "booking", body: unknown, headers = {}) {
 return secureSubmission(new Request("https://ona.rest/api/" + form, { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "192.0.2.1", ...headers }, body: JSON.stringify(body) }), form, async () => { saves++; });
}
async function rejected(form: "contact" | "booking", body: unknown, code = 400) {
 await assert.rejects(submit(form, body), error => error instanceof SubmissionError && error.status === code); assert.equal(saves, 0);
}
for (const form of ["contact", "booking"] as const) {
 test(form + " widget provides the required verification action", () => {
   const page = form === "booking" ? "book/BookContent" : "contact/ContactContent";
   const source = readFileSync(new URL("../src/app/[locale]/" + page + ".tsx", import.meta.url), "utf8");
   const widget = source.match(/<Turnstile\s[\s\S]*?\/>/)?.[0];
   assert.ok(widget, "The form must render its Turnstile widget");
   assert.match(widget, new RegExp('action="' + form + '"'));
 });
 const body = form === "contact" ? contact : booking;
 test(form + " valid submission", async () => { response = { ...(response as object), action: form }; await submit(form, body); assert.equal(saves, 1); });
 test(form + " missing token", () => rejected(form, { ...body, captchaToken: undefined }));
 test(form + " invalid token", async () => { response = { success: false, "error-codes": ["invalid-input-response"] }; await rejected(form, body); });
 test(form + " success false", async () => { response = { success: false }; await rejected(form, body); });
 test(form + " API error", async () => { status = 503; await rejected(form, body); });
 test(form + " timeout", async () => { throws = true; await rejected(form, body); });
 test(form + " wrong action", async () => { response = { ...(response as object), action: form === "contact" ? "booking" : "contact" }; await rejected(form, body); });
 test(form + " wrong hostname", async () => { response = { ...(response as object), hostname: "attacker.example" }; await rejected(form, body); });
 test(form + " malformed response", async () => { response = null; await rejected(form, body); });
 test(form + " missing secret", async () => { delete process.env.TURNSTILE_SECRET_KEY; await rejected(form, body); });
 test(form + " honeypot", () => rejected(form, { ...body, website: "spam" }));
 test(form + " email", () => rejected(form, { ...body, email: "bad" }));
 test(form + " oversized field", () => rejected(form, { ...body, name: "a".repeat(101) }));
 test(form + " wrong type", () => rejected(form, { ...body, name: {} }));
 test(form + " oversized payload", () => rejected(form, { ...body, notes: "x".repeat(17000) }, 413));
 test(form + " timing", () => rejected(form, { ...body, formStartedAt: Date.now() }));
 test(form + " rate limit", async () => { for (let i = 0; i < (form === "contact" ? 5 : 8); i++) await rejected(form, { ...body, captchaToken: undefined }); await rejected(form, body, 429); });
 test(form + " duplicate", async () => { response = { ...(response as object), action: form }; await submit(form, body); await assert.rejects(submit(form, body), error => error instanceof SubmissionError && error.status === 409); assert.equal(saves, 1); });
}
for (const guests of [0, 8, 1.5, "2", null]) test("invalid guests " + guests, () => rejected("booking", { ...booking, guests }));
for (const invalid of ["1970-05-31", "2020-01-01", "2099-01-01", "2026-02-30", "invalid"]) test("invalid date " + invalid, () => rejected("booking", { ...booking, date: invalid }));
test("invalid time", () => rejected("booking", { ...booking, time: "25:00" }));
test("Sofia calendar day", () => { assert.equal(validBookingDate("2026-10-01", new Date("2026-09-30T22:00:00Z")), true); assert.equal(validBookingDate("2026-09-30", new Date("2026-09-30T22:00:00Z")), false); });
test("model rejects 1970", async () => { await assert.rejects(new Booking({ ...booking, date: "1970-05-31" }).validate()); });
test("untrusted forwarding headers ignored", () => { delete process.env.FORM_TRUSTED_PROXY; assert.equal(getRemoteIp(new Headers({ "cf-connecting-ip": "192.0.2.1", "x-forwarded-for": "192.0.2.1" })), null); });
test("verification request uses secret and no cache", async () => { global.fetch = async (url, options) => { assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify"); assert.equal((options?.body as URLSearchParams).get("secret"), "test-secret"); assert.equal(options?.cache, "no-store"); assert.ok(options?.signal); return new Response(JSON.stringify(response)); }; assert.equal((await verifyTurnstile("token", "contact")).success, true); });
