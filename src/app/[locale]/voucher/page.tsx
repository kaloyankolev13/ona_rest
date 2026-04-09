"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animateLettersOnScroll,
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import animStyles from "@/animations/animations.module.css";
import { SmoothScroll } from "@/components";
import { ShevitsaDecor } from "@/components/ShevitsaDecor/ShevitsaDecor";
import styles from "./Voucher.module.css";

gsap.registerPlugin(ScrollTrigger);

function splitToLetters(text: string, className: string) {
  return text.split(" ").map((word, wi) => (
    <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
      {word.split("").map((char, ci) => (
        <span key={ci} className={className}>{char}</span>
      ))}
      {wi < text.split(" ").length - 1 && (
        <span className={className}>{"\u00A0"}</span>
      )}
    </span>
  ));
}

export default function VoucherPage() {
  const t = useTranslations("VoucherPage");

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);
  const introTextRef = useRef<HTMLParagraphElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 }
        );
      }

      if (introHeadingRef.current) {
        animateLettersOnScroll(
          introHeadingRef.current,
          `.${animStyles.letter}`,
          { stagger: 0.02, duration: 0.35 }
        );
      }

      if (introTextRef.current) {
        animateRevealOnScroll(introTextRef.current, {
          y: 30, duration: 0.6, delay: 0.3,
        });
      }

      [formatRef, howRef, experienceRef, pricingRef, ctaRef].forEach((ref) => {
        if (ref.current) {
          animateRevealOnScroll(ref.current, {
            y: 50, duration: 0.7, delay: 0.1,
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <ShevitsaDecor variant={4} />
        <span className={styles.heroSubtitle}>{t("heroSubtitle")}</span>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>
          {t("heroTitle")}
        </h1>
      </section>

      {/* ── Intro ── */}
      <section className={styles.section}>
        <ShevitsaDecor variant={9} />
        <div className={styles.narrow}>
          <h2 ref={introHeadingRef} className={styles.sectionHeading}>
            {splitToLetters(t("introHeading"), animStyles.letter)}
          </h2>
          <p ref={introTextRef} className={styles.leadText}>
            {t("introText")}
          </p>
        </div>
      </section>

      {/* ── What you receive ── */}
      <section className={styles.sectionDark}>
        <div ref={formatRef} className={styles.narrow}>
          <span className={styles.tag}>{t("formatTag")}</span>
          <div className={styles.formatGrid}>
            <div className={styles.formatCard}>
              <h3 className={styles.formatTitle}>{t("scrollTitle")}</h3>
              <p className={styles.formatText}>{t("scrollText")}</p>
            </div>
            <div className={styles.formatCard}>
              <h3 className={styles.formatTitle}>{t("blankTitle")}</h3>
              <p className={styles.formatText}>{t("blankText")}</p>
            </div>
          </div>
          <p className={styles.formatNote}>{t("blankNote")}</p>
        </div>
      </section>

      {/* ── How vouchers work ── */}
      <section className={styles.section}>
        <ShevitsaDecor variant={5} />
        <div ref={howRef} className={styles.narrow}>
          <span className={styles.tagDark}>{t("howItWorksTag")}</span>
          <div className={styles.textBlock}>
            <p className={styles.bodyText}>{t("howText1")}</p>
            <p className={styles.bodyText}>{t("howText2")}</p>
            <p className={styles.bodyText}>{t("howText3")}</p>
            <p className={styles.noteText}>{t("howNote")}</p>
          </div>
        </div>
      </section>

      {/* ── What the experience includes ── */}
      <section className={styles.sectionDark}>
        <div ref={experienceRef} className={styles.narrow}>
          <span className={styles.tag}>{t("experienceTag")}</span>
          <ul className={styles.expList}>
            <li className={styles.expItem}>{t("exp1")}</li>
            <li className={styles.expItem}>{t("exp2")}</li>
            <li className={styles.expItem}>{t("exp3")}</li>
            <li className={styles.expItem}>{t("exp4")}</li>
          </ul>
          <div className={styles.addons}>
            <h4 className={styles.addonsTitle}>{t("addonsTitle")}</h4>
            <ul className={styles.addonList}>
              <li className={styles.addonItem}>{t("addon1")}</li>
              <li className={styles.addonItem}>{t("addon2")}</li>
              <li className={styles.addonItem}>{t("addon3")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className={styles.section}>
        <ShevitsaDecor variant={10} />
        <div ref={pricingRef} className={styles.narrow}>
          <span className={styles.tagDark}>{t("pricingTag")}</span>
          <div className={styles.priceList}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>{t("priceMain")}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>{t("priceWine")}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>{t("priceBreakfast")}</span>
            </div>
          </div>
          <div className={styles.fullPackage}>
            <span className={styles.fullPackageLabel}>
              {t("priceFullLabel")}
            </span>
            <span className={styles.fullPackageDesc}>
              {t("priceFullDesc")}
            </span>
            <span className={styles.fullPackageValue}>
              {t("priceFullValue")}
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.sectionDark}>
        <div ref={ctaRef} className={styles.narrow}>
          <span className={styles.tag}>{t("ctaTag")}</span>
          <p className={styles.ctaText}>{t("ctaText")}</p>
          <Link href="/contact" className={styles.ctaButton}>
            {t("ctaButton")}
          </Link>
          <p className={styles.closing}>{t("ctaClosing")}</p>
        </div>
      </section>
    </SmoothScroll>
  );
}
