"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animateLettersOnScroll,
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import animStyles from "@/animations/animations.module.css";
import { SmoothScroll } from "@/components";
import styles from "./Voucher.module.css";

gsap.registerPlugin(ScrollTrigger);

function splitToLetters(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={className}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

const VOUCHER_OPTIONS = [
  { key: "option1", descKey: "option1Desc" },
  { key: "option2", descKey: "option2Desc" },
  { key: "option3", descKey: "option3Desc" },
  { key: "option4", descKey: "option4Desc" },
] as const;

export default function VoucherPage() {
  const t = useTranslations("VoucherPage");

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

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

      if (introRef.current) {
        const text = introRef.current.querySelector(`.${styles.introText}`);
        if (text) {
          animateRevealOnScroll(text, {
            y: 30,
            duration: 0.6,
            delay: 0.4,
          });
        }
      }

      if (optionsRef.current) {
        const cards = optionsRef.current.querySelectorAll(
          `.${styles.optionCard}`
        );
        if (cards.length) {
          animateRevealOnScroll(cards, {
            y: 60,
            duration: 0.7,
            stagger: 0.12,
          });
        }
      }

      if (stepsRef.current) {
        const steps = stepsRef.current.querySelectorAll(`.${styles.step}`);
        if (steps.length) {
          animateRevealOnScroll(steps, {
            y: 50,
            duration: 0.7,
            stagger: 0.15,
          });
        }
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.heroSubtitle}>{t("heroSubtitle")}</span>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>
          {t("heroTitle")}
        </h1>
      </section>

      {/* Intro */}
      <section className={styles.intro}>
        <div ref={introRef} className={styles.introInner}>
          <h2 ref={introHeadingRef} className={styles.introHeading}>
            {splitToLetters(t("introHeading"), animStyles.letter)}
          </h2>
          <p className={styles.introText}>{t("introText")}</p>
        </div>
      </section>

      {/* Voucher Options */}
      <section className={styles.options}>
        <div className={styles.optionsInner}>
          <span className={styles.tag}>{t("optionsTag")}</span>
          <div ref={optionsRef} className={styles.optionsGrid}>
            {VOUCHER_OPTIONS.map((opt) => (
              <div key={opt.key} className={styles.optionCard}>
                <span className={styles.optionAmount}>
                  {t(opt.key as "option1")}
                </span>
                <p className={styles.optionDesc}>
                  {t(opt.descKey as "option1Desc")}
                </p>
                <button className={styles.selectBtn}>
                  {t("selectBtn")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.howInner}>
          <span className={`${styles.tag} ${styles.tagDark}`}>
            {t("howItWorksTag")}
          </span>
          <div ref={stepsRef} className={styles.stepsGrid}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.step}>
                <span className={styles.stepNumber}>0{n}</span>
                <h3 className={styles.stepTitle}>
                  {t(`step${n}Title` as "step1Title")}
                </h3>
                <p className={styles.stepText}>
                  {t(`step${n}Text` as "step1Text")}
                </p>
              </div>
            ))}
          </div>
          <p className={styles.contactNote}>{t("contactNote")}</p>
        </div>
      </section>
    </SmoothScroll>
  );
}
