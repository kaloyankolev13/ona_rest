"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import styles from "./SideBar.module.css";

const navItems = [
  { key: "home" as const, href: "/" as const },
  { key: "voucher" as const, href: "/voucher" as const },
  { key: "aboutUs" as const, href: "/about" as const },
  { key: "contact" as const, href: "/contact" as const },
  { key: "news" as const, href: "/news" as const },
];

export function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Nav");
  const tFooter = useTranslations("Footer");

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const switchLocale = (newLocale: "bg" | "en") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      {/* Hamburger / X toggle — always visible, sits above the overlay */}
      <div className={styles.triggerWrapper}>
        <button
          className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ""}`}
          onClick={handleToggle}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={styles.line} />
        </button>
      </div>

      {/* Full-screen navigation overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.overlayInner}>
          {/* ── Header ── */}
          <header className={styles.overlayHeader}>
            {/* Logo */}
            <div className={styles.logo}>
              <svg
                width="26"
                height="30"
                viewBox="0 0 26 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="ONA logo"
              >
                <path
                  d="M9 1L13 5L17 1"
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 5V12"
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="13" cy="16" r="6" stroke="#333" strokeWidth="1.5" />
                <path
                  d="M13 22V28"
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M9 28H17"
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Language switcher */}
            <div className={styles.languageSwitcher}>
              <button
                className={`${styles.langBtn} ${locale === "bg" ? styles.langActive : ""}`}
                onClick={() => switchLocale("bg")}
              >
                BG
              </button>
              <span className={styles.langDivider}>|</span>
              <button
                className={`${styles.langBtn} ${locale === "en" ? styles.langActive : ""}`}
                onClick={() => switchLocale("en")}
              >
                EN
              </button>
            </div>

            {/* Spacer — the hamburger/X button sits on top at this position */}
            <div className={styles.headerSpacer} />
          </header>

          {/* ── Navigation links ── */}
          <nav className={styles.nav}>
            {navItems.map((item, itemIndex) => {
              const label = t(item.key);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""} ${isOpen ? styles.navItemAnimating : ""}`}
                  onClick={() => setIsOpen(false)}
                  style={{ "--item-index": itemIndex } as React.CSSProperties}
                >
                  <span className={styles.navItemInner}>
                    {label.split("").map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className={styles.letter}
                        style={
                          { "--letter-index": charIndex } as React.CSSProperties
                        }
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ── Book a table ── */}
          <div className={styles.bookWrapper}>
            <Link
              href="/book"
              className={styles.bookButton}
              onClick={() => setIsOpen(false)}
            >
              {t("bookTable")}
            </Link>
          </div>

          {/* ── Footer info ── */}
          <footer className={styles.overlayFooter}>
            <div className={styles.footerBlock}>
              <h4 className={styles.footerTitle}>{tFooter("workingHours")}</h4>
              <p className={styles.footerText}>
                {tFooter("scheduleTueFri")}
              </p>
              <p className={styles.footerText}>
                {tFooter("scheduleSatSun")}
              </p>
              <p className={styles.footerText}>{tFooter("scheduleMon")}</p>
            </div>
            <div className={styles.footerBlock}>
              <h4 className={styles.footerTitle}>{tFooter("address")}</h4>
              <p className={styles.footerText}>{tFooter("addressValue")}</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
