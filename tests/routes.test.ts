import test from "node:test";
import assert from "node:assert/strict";
import { POST as contact } from "../src/app/api/contact/route";
import { POST as booking } from "../src/app/api/booking/route";
import { resetFormSecurityForTests } from "../src/lib/form-security";
const fields = { name: "Test User", email: "user@example.com", subject: "Question", message: "Hello restaurant", phone: "+359888123456", guests: 2, date: new Date(Date.now() + 86400000).toISOString().slice(0, 10) };
for (const [form, handler] of [["contact", contact], ["booking", booking]] as const) {
 test(form + " route returns 400 for missing token without MongoDB", async () => { resetFormSecurityForTests(); process.env.TURNSTILE_SECRET_KEY = "test-secret"; const response = await handler(new Request("https://ona.rest/api/" + form, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(fields) })); assert.equal(response.status, 400); assert.deepEqual(await response.json(), { error: "Verification failed" }); });
 test(form + " route returns 429", async () => { resetFormSecurityForTests(); process.env.FORM_TRUSTED_PROXY = "cloudflare"; let response: Response | undefined; for (let i = 0; i <= (form === "contact" ? 5 : 8); i++) response = await handler(new Request("https://ona.rest/api/" + form, { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "192.0.2.1" }, body: JSON.stringify(fields) })); assert.equal(response?.status, 429); assert.equal(response?.headers.get("retry-after"), "600"); });
}
