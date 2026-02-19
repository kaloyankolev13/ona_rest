"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import logoOna from "@/assets/logo-ona.svg";
import styles from "./Footer.module.css";

const navLinks = [
  { key: "home" as const, href: "/" as const },
  { key: "aboutUs" as const, href: "/about" as const },
  { key: "news" as const, href: "/news" as const },
  { key: "contact" as const, href: "/contact" as const },
  { key: "bookTable" as const, href: "/book" as const },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "TikTok", href: "#" },
];

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  return (
    <footer className={styles.footer}>
      {/* ── Top row: info + logo + info ── */}
      <div className={styles.topRow}>
        <div className={styles.infoCol}>
          <div className={styles.infoBlock}>
            <h4 className={styles.infoTitle}>{t("address")}</h4>
            <p className={styles.infoText}>{t("addressValue")}</p>
          </div>
          <div className={styles.infoBlock}>
            <h4 className={styles.infoTitle}>{t("workingHours")}</h4>
            <p className={styles.infoText}>{t("scheduleTueFri")}</p>
            <p className={styles.infoText}>{t("scheduleSatSun")}</p>
            <p className={styles.infoText}>{t("scheduleMon")}</p>
          </div>
        </div>

        <div className={styles.logoBlock}>
          <Image
            src={logoOna}
            alt="ONA"
            className={styles.logo}
            width={280}
            height={280}
          />
        </div>

        <div className={styles.infoColRight}>
          <div className={styles.infoBlock}>
            <h4 className={styles.infoTitle}>Contact</h4>
            <p className={styles.infoText}>info@ona.bg</p>
            <p className={styles.infoText}>+359 000 000 000</p>
          </div>
          <div className={styles.infoBlock}>
            <h4 className={styles.infoTitle}>Social</h4>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className={styles.bottomRow}>
        <div className={styles.legal}>
          <p className={styles.legalText}>ONA Restaurant</p>
          <p className={styles.legalText}>All rights reserved © {new Date().getFullYear()}</p>
        </div>

        <nav className={styles.footerNav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.footerLink}>
              {tNav(link.key)}
            </Link>
          ))}
        </nav>

        <div className={styles.legalRight}>
          <a href="#" className={styles.footerLink}>Privacy Policy</a>
          <a href="#" className={styles.footerLink}>Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
