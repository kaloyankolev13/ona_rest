"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animateRevealOnScroll } from "@/animations/scrollAnimations";
import { SmoothScroll } from "@/components";
import styles from "./Book.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function BookPage() {
  const t = useTranslations("BookPage");
  const guestOptions = t.raw("guestOptions") as string[];
  const timeSlots = t.raw("timeSlots") as string[];

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 }
        );
      }

      if (formRef.current) {
        animateRevealOnScroll(formRef.current, {
          y: 50,
          duration: 0.8,
          start: "top 90%",
        });
      }

      if (infoRef.current) {
        const cards = infoRef.current.querySelectorAll(`.${styles.infoCard}`);
        if (cards.length) {
          animateRevealOnScroll(cards, {
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
        <p className={styles.heroIntro}>{t("introText")}</p>
      </section>

      {/* Reservation Form */}
      <section className={styles.formSection}>
        <div ref={formRef} className={styles.formInner}>
          <span className={styles.tag}>{t("formTag")}</span>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldDate")}</label>
                <input type="date" className={styles.input} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldTime")}</label>
                <select className={styles.select}>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldGuests")}</label>
                <select className={styles.select}>
                  {guestOptions.map((opt, i) => (
                    <option key={i} value={i + 1}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldName")}</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={t("fieldName")}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldPhone")}</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder={t("fieldPhone")}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t("fieldEmail")}</label>
              <input
                type="email"
                className={styles.input}
                placeholder={t("fieldEmail")}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t("fieldNotes")}</label>
              <textarea
                className={styles.textarea}
                placeholder={t("fieldNotes")}
                rows={3}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              {t("submitBtn")} <span className={styles.arrow}>→</span>
            </button>
          </form>
        </div>
      </section>

      {/* Info Cards */}
      <section className={styles.infoSection}>
        <div className={styles.infoInner}>
          <span className={styles.tag} style={{ color: "rgba(51,51,51,0.45)" }}>
            {t("infoTag")}
          </span>
          <div ref={infoRef} className={styles.infoGrid}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.infoCard}>
                <div className={styles.infoIcon} />
                <h3 className={styles.infoTitle}>
                  {t(`info${n}Title` as "info1Title")}
                </h3>
                <p className={styles.infoText}>
                  {t(`info${n}Text` as "info1Text")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SmoothScroll>
  );
}
