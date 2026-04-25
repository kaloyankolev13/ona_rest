const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
}

/**
 * Verify a Cloudflare Turnstile token against the siteverify endpoint.
 *
 * If TURNSTILE_SECRET_KEY is not configured, verification is skipped and
 * `success: true` is returned, with a warning logged. This keeps local
 * development working before the secret is provisioned. In production,
 * make sure the env variable is set.
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string | null
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn(
      "TURNSTILE_SECRET_KEY is not set — skipping CAPTCHA verification."
    );
    return { success: true };
  }

  if (!token || typeof token !== "string") {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);
    if (remoteIp) formData.append("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Turnstile siteverify HTTP error:", res.status);
      return { success: false, errorCodes: [`http-${res.status}`] };
    }

    const data = (await res.json()) as SiteverifyResponse;
    return {
      success: data.success === true,
      errorCodes: data["error-codes"],
    };
  } catch (err) {
    console.error("Turnstile siteverify request failed:", err);
    return { success: false, errorCodes: ["network-error"] };
  }
}

/**
 * Best-effort extraction of the visitor's IP from common headers.
 * Cloudflare sets `cf-connecting-ip`, Vercel sets `x-forwarded-for`.
 */
export function getRemoteIp(headers: Headers): string | null {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;
  const real = headers.get("x-real-ip");
  if (real) return real;
  return null;
}
