import { createHmac } from "node:crypto";
import { getRemoteIp, verifyTurnstile } from "./turnstile";
import { FormError, validateFields } from "./form-validation";

const buckets = new Map<string, { count: number; until: number }>();
const duplicates = new Map<string, number>();
const MAX_BODY = 16384;
export class SubmissionError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function resetFormSecurityForTests() { buckets.clear(); duplicates.clear(); }
function digest(value: string) { return createHmac("sha256", process.env.FORM_SECURITY_HASH_KEY || process.env.TURNSTILE_SECRET_KEY || "unconfigured").update(value).digest("hex"); }
export async function secureSubmission(request: Request, form: "contact" | "booking", processSubmission: (fields: ReturnType<typeof validateFields>) => Promise<void>, claim?: (request: Request, form: "contact" | "booking", fields: ReturnType<typeof validateFields>) => Promise<() => Promise<void>>) {
  const ip = getRemoteIp(request.headers);
  const source = ip ? digest(ip) : "unknown";
  const log = (category: string, extra = {}) => console.info(JSON.stringify({ event: "form_submission", form, timestamp: new Date().toISOString(), source, userAgent: request.headers.get("user-agent")?.slice(0, 200), category, ...extra }));
  const reject = (status: number, category: string, message = "Unable to submit form"): never => { log(category); throw new SubmissionError(status, message); };
  if (request.method !== "POST") reject(405, "method");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") reject(415, "content_type");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) reject(403, "origin");
  if (Number(request.headers.get("content-length")) > MAX_BODY) reject(413, "payload_size");
  let body: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reject(400, "invalid_json");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); return reject(413, "payload_size"); }
      chunks.push(chunk.value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return reject(400, "invalid_json");
    body = parsed as Record<string, unknown>;
  } catch (error) { if (error instanceof SubmissionError) throw error; return reject(400, "invalid_json"); }
  if (body.website !== undefined && (typeof body.website !== "string" || body.website.trim())) reject(400, "abuse_signal");
  // Client timing is only an additional signal; Turnstile remains mandatory.
  if (body.formStartedAt !== undefined && (typeof body.formStartedAt !== "number" || !Number.isFinite(body.formStartedAt) || Date.now() - body.formStartedAt < 800)) reject(400, "timing");
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.until <= now) buckets.delete(key);
  for (const [key, expiry] of duplicates) if (expiry <= now) duplicates.delete(key);
  const key = form + ":" + source;
  const bucket = buckets.get(key) || { count: 0, until: now + 600000 };
  if (buckets.size >= 10000 && !buckets.has(key)) reject(429, "rate_limit", "Too many requests");
  bucket.count++; buckets.set(key, bucket);
  // Without a trusted IP, use a generous shared fallback rather than trusting spoofable headers.
  if (bucket.count > (ip ? (form === "contact" ? 5 : 8) : 100)) reject(429, "rate_limit", "Too many requests");
  let fields: ReturnType<typeof validateFields>;
  try { fields = validateFields(form, body); } catch (error) { return reject(400, "validation", error instanceof FormError ? error.message : "Unable to submit form"); }
  const captcha = await verifyTurnstile(body.captchaToken, form, ip);
  log("turnstile", captcha);
  if (!captcha.success) reject(400, "verification", "Verification failed");
  const duplicateKey = form + ":" + source + ":" + digest(JSON.stringify(fields));
  if (duplicates.has(duplicateKey)) reject(409, "duplicate");
  if (duplicates.size >= 10000) reject(429, "capacity", "Too many requests");
  let release: (() => Promise<void>) | undefined;
  try { release = await claim?.(request, form, fields); } catch (error) { log(error instanceof SubmissionError ? (error.status === 429 ? "rate_limit" : "duplicate") : "abuse_store_unavailable"); throw error; }
  duplicates.set(duplicateKey, now + 120000);
  try { await processSubmission(fields); } catch (error) { duplicates.delete(duplicateKey); await release?.(); log("processing_failed"); throw error; }
  log("accepted");
}
