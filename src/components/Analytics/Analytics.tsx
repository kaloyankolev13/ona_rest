"use client";

import { useEffect } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (!gaId) return;

    window.gtag?.("consent", "default", {
      analytics_storage: "denied",
    });

    function syncConsent() {
      const consent = getCookie("cookie_consent");
      if (consent === "accepted") {
        window.gtag?.("consent", "update", { analytics_storage: "granted" });
      } else if (consent === "rejected") {
        window.gtag?.("consent", "update", { analytics_storage: "denied" });
      }
    }

    syncConsent();
    window.addEventListener("cookie_consent_update", syncConsent);
    return () => window.removeEventListener("cookie_consent_update", syncConsent);
  }, [gaId]);

  if (!gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
