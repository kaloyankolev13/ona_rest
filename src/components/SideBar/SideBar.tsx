"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SideBar.module.css";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "VOUCHER", href: "/voucher" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT", href: "/contact" },
  { label: "NEWS", href: "/news" },
];

export function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"BG" | "EN">("EN");
  const pathname = usePathname();

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
                className={`${styles.langBtn} ${activeLanguage === "BG" ? styles.langActive : ""}`}
                onClick={() => setActiveLanguage("BG")}
              >
                BG
              </button>
              <span className={styles.langDivider}>|</span>
              <button
                className={`${styles.langBtn} ${activeLanguage === "EN" ? styles.langActive : ""}`}
                onClick={() => setActiveLanguage("EN")}
              >
                EN
              </button>
            </div>

            {/* Spacer — the hamburger/X button sits on top at this position */}
            <div className={styles.headerSpacer} />
          </header>

          {/* ── Navigation links ── */}
          <nav className={styles.nav}>
            {navItems.map((item, itemIndex) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""} ${isOpen ? styles.navItemAnimating : ""}`}
                onClick={() => setIsOpen(false)}
                style={{ "--item-index": itemIndex } as React.CSSProperties}
              >
                <span className={styles.navItemInner}>
                  {item.label.split("").map((char, charIndex) => (
                    <span
                      key={charIndex}
                      className={styles.letter}
                      style={{ "--letter-index": charIndex } as React.CSSProperties}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
              </Link>
            ))}
          </nav>

          {/* ── Book a table ── */}
          <div className={styles.bookWrapper}>
            <Link
              href="/book"
              className={styles.bookButton}
              onClick={() => setIsOpen(false)}
            >
              BOOK A TABLE
            </Link>
          </div>

          {/* ── Footer info ── */}
          <footer className={styles.overlayFooter}>
            <div className={styles.footerBlock}>
              <h4 className={styles.footerTitle}>WORKING HOURS</h4>
              <p className={styles.footerText}>Tue-Fri 11 AM - 10 PM</p>
              <p className={styles.footerText}>Sat-Sun 12 AM - 10 PM</p>
              <p className={styles.footerText}>Mon (Closed)</p>
            </div>
            <div className={styles.footerBlock}>
              <h4 className={styles.footerTitle}>ADDRESS</h4>
              <p className={styles.footerText}>Skatevtsi, 31 Street №3</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
