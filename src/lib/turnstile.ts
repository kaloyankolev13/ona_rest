import { isIP } from "node:net";

export async function verifyTurnstile(token: unknown, action: "contact" | "booking", remoteIp?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const hostnames = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || "ona.rest,www.ona.rest").split(",").map(h => h.trim().toLowerCase()).filter(Boolean);
  if (!secret || !hostnames.length) return { success: false, errorCodes: ["configuration-error"] };
  if (typeof token !== "string" || !token.trim() || token.length > 2048) return { success: false, errorCodes: ["invalid-input-response"] };
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { success: false, errorCodes: ["verification-http-error"] };
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return { success: false, errorCodes: ["malformed-response"] };
    const result = data as Record<string, unknown>;
    const hostname = typeof result.hostname === "string" ? result.hostname.toLowerCase() : undefined;
    const returnedAction = typeof result.action === "string" ? result.action : undefined;
    const challengeTs = typeof result.challenge_ts === "string" ? result.challenge_ts : undefined;
    const age = challengeTs ? Date.now() - Date.parse(challengeTs) : NaN;
    const errorCodes = Array.isArray(result["error-codes"]) ? result["error-codes"].filter((v): v is string => typeof v === "string").slice(0, 10) : [];
    const success = result.success === true && !!hostname && hostnames.includes(hostname) && returnedAction === action && Number.isFinite(age) && age >= -60000 && age <= 300000;
    if (result.success === true && !success) errorCodes.push("verification-metadata-mismatch");
    return { success, hostname, action: returnedAction, challengeTs, errorCodes };
  } catch {
    return { success: false, errorCodes: ["verification-unavailable"] };
  }
}

// Enable only when the origin cannot be reached except through the selected proxy.
export function getRemoteIp(headers: Headers): string | null {
  const proxy = process.env.FORM_TRUSTED_PROXY;
  const value = proxy === "cloudflare" ? headers.get("cf-connecting-ip") : proxy === "vercel" ? headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : null;
  return value && isIP(value) ? value : null;
}
