"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./CookieConsent.module.css";

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

export function CookieConsent() {
  const t = useTranslations("CookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie("cookie_consent")) {
      setVisible(true);
    }
  }, []);

  function respond(choice: "accepted" | "rejected") {
    setCookie("cookie_consent", choice, 365);
    setVisible(false);
    window.dispatchEvent(new Event("cookie_consent_update"));
  }

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <p className={styles.message}>
        {t("message")}{" "}
        <Link href="/privacy" className={styles.link}>
          {t("learnMore")}
        </Link>
      </p>
      <div className={styles.actions}>
        <button className={styles.accept} onClick={() => respond("accepted")}>
          {t("accept")}
        </button>
        <button className={styles.reject} onClick={() => respond("rejected")}>
          {t("reject")}
        </button>
      </div>
    </div>
  );
}
