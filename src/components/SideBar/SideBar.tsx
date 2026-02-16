"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import gsap from "gsap";
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

  const overlayRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Close menu when pathname changes (render-time state adjustment)
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

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

  // GSAP open / close animation
  useEffect(() => {
    const overlay = overlayRef.current;
    const nav = navRef.current;
    if (!overlay || !nav) return;

    tlRef.current?.kill();
    gsap.killTweensOf(overlay);

    if (isOpen) {
      const borders = nav.querySelectorAll<HTMLElement>(
        `.${styles.borderLine}`
      );
      const navItemEls = nav.querySelectorAll<HTMLElement>(
        `.${styles.navItem}`
      );
      const allLetters = nav.querySelectorAll<HTMLElement>(
        `.${styles.letter}`
      );

      // Reset initial states
      gsap.set(borders, { scaleX: 0 });
      gsap.set(allLetters, { opacity: 0, y: "100%" });
      if (bookRef.current) gsap.set(bookRef.current, { opacity: 0, y: 20 });
      if (footerRef.current)
        gsap.set(footerRef.current, { opacity: 0, y: 20 });

      // Slide overlay in
      gsap.fromTo(
        overlay,
        { x: "100%", opacity: 0, visibility: "visible" },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.inOut" }
      );

      // Content entrance timeline (starts slightly after overlay begins)
      const tl = gsap.timeline({ delay: 0.15 });

      // Borders expand left-to-right, staggered per item
      tl.to(
        borders,
        {
          scaleX: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.12,
        },
        0
      );

      // Letters slide up, staggered per item then per letter
      navItemEls.forEach((navItem, i) => {
        const letters = navItem.querySelectorAll<HTMLElement>(
          `.${styles.letter}`
        );
        tl.to(
          letters,
          {
            opacity: 1,
            y: "0%",
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.035,
          },
          i * 0.12 + 0.05
        );
      });

      // Book button fade in
      if (bookRef.current) {
        tl.to(
          bookRef.current,
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );
      }

      // Footer fade in
      if (footerRef.current) {
        tl.to(
          footerRef.current,
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );
      }

      tlRef.current = tl;
    } else {
      // Slide overlay out
      gsap.to(overlay, {
        x: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(overlay, { visibility: "hidden" });
        },
      });

      tlRef.current = null;
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    const overlay = overlayRef.current;
    return () => {
      tlRef.current?.kill();
      if (overlay) gsap.killTweensOf(overlay);
    };
  }, []);

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
          className={`${styles.menuTrigger} ${isOpen ? styles.menuTriggerOpen : ""}`}
          onClick={handleToggle}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <span className={styles.menuLabel}>MENU</span>
          <span className={styles.hamburgerIcon}>
            <span className={styles.line} />
            <span className={styles.line} />
            <span className={styles.line} />
          </span>
        </button>
      </div>

      {/* Full-screen navigation overlay */}
      <div
        ref={overlayRef}
        className={styles.overlay}
        aria-hidden={!isOpen}
      >
        <div className={styles.overlayInner}>
          {/* ── Header ── */}
          <header className={styles.overlayHeader}>
            {/* Logo */}
            <div className={styles.logo}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="51.44"
                height="51.91"
                viewBox="0 0 51.44 51.91"
                aria-label="ONA logo"
              >
                <g data-name="Layer 2">
                  <g data-name="Layer 1">
                    <path
                      d="M25.73,0a7.3,7.3,0,1,1-7.29,7.3A7.3,7.3,0,0,1,25.73,0Z"
                      fill="#333"
                      fillRule="evenodd"
                    />
                    <path
                      d="M1,6.39,5.77,2.7c1.05-.76.87-1,1.71.28C11,8.55,16.54,13.73,23.41,18.09,15.8,19.74,7.79,15.8.64,8.2c-1-1.12-.72-1,.33-1.81Z"
                      fill="#333"
                      fillRule="evenodd"
                    />
                    <path
                      d="M50.47,6.39,45.67,2.7c-1.05-.76-.87-1-1.71.28C40.4,8.55,34.9,13.73,28,18.09,35.64,19.74,43.65,15.8,50.8,8.2c1-1.12.72-1-.33-1.81Z"
                      fill="#333"
                      fillRule="evenodd"
                    />
                    <path
                      d="M24.6,21.79A109.58,109.58,0,0,1,3.71,45.33c-.92.8-1.69,1.44,0,2.08C12,50.52,16.91,51.94,26,51.9c7.24.16,14.49-2.19,21.43-4.69,1.45-.52.6-1.4-.14-2.05C38.16,37.1,31.43,29.73,26.37,21.68c-.81-1.3-1.09-.95-1.77.11Z"
                      fill="#333"
                      fillRule="evenodd"
                    />
                  </g>
                </g>
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
          <nav ref={navRef} className={styles.nav}>
            {navItems.map((item) => {
              const label = t(item.key);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className={styles.navItemInner}>
                    {label.split("").map((char, charIndex) => (
                      <span key={charIndex} className={styles.letter}>
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </span>
                  <span className={styles.borderLine} />
                </Link>
              );
            })}
          </nav>

          {/* ── Book a table ── */}
          <div ref={bookRef} className={styles.bookWrapper}>
            <Link
              href="/book"
              className={styles.bookButton}
              onClick={() => setIsOpen(false)}
            >
              {t("bookTable")}
            </Link>
          </div>

          {/* ── Footer info ── */}
          <footer ref={footerRef} className={styles.overlayFooter}>
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
