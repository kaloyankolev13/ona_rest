"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animateRevealOnScroll } from "@/animations/scrollAnimations";
import { SmoothScroll } from "@/components";
import styles from "./Contact.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const t = useTranslations("ContactPage");

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 }
        );
      }

      if (infoRef.current) {
        const blocks = infoRef.current.querySelectorAll(`.${styles.infoBlock}`);
        if (blocks.length) {
          animateRevealOnScroll(blocks, {
            y: 40,
            duration: 0.6,
            stagger: 0.12,
          });
        }
      }

      if (formRef.current) {
        animateRevealOnScroll(formRef.current, {
          y: 50,
          duration: 0.8,
          delay: 0.2,
        });
      }

      if (mapRef.current) {
        animateRevealOnScroll(mapRef.current, {
          y: 60,
          duration: 0.8,
        });
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

      {/* Content: Info + Form */}
      <section className={styles.content}>
        <div className={styles.contentInner}>
          <div ref={infoRef} className={styles.infoColumn}>
            <span className={styles.tag}>{t("infoTag")}</span>

            <div className={styles.infoBlock}>
              <h4 className={styles.infoLabel}>{t("addressLabel")}</h4>
              <p className={styles.infoValue}>{t("addressValue")}</p>
            </div>

            <div className={styles.infoBlock}>
              <h4 className={styles.infoLabel}>{t("phoneLabel")}</h4>
              <p className={styles.infoValue}>{t("phoneValue")}</p>
            </div>

            <div className={styles.infoBlock}>
              <h4 className={styles.infoLabel}>{t("emailLabel")}</h4>
              <p className={styles.infoValue}>{t("emailValue")}</p>
            </div>

            <div className={styles.infoBlock}>
              <h4 className={styles.infoLabel}>{t("hoursLabel")}</h4>
              <p className={styles.infoValue}>{t("hoursTueFri")}</p>
              <p className={styles.infoValue}>{t("hoursSatSun")}</p>
              <p className={styles.infoValue}>{t("hoursMon")}</p>
            </div>
          </div>

          <div ref={formRef} className={styles.formColumn}>
            <span className={styles.tag}>{t("formTag")}</span>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t("formName")}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={t("formName")}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t("formEmail")}</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder={t("formEmail")}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("formSubject")}</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={t("formSubject")}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("formMessage")}</label>
                <textarea
                  className={styles.textarea}
                  placeholder={t("formMessage")}
                  rows={5}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                {t("formSend")} <span className={styles.arrow}>→</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className={styles.map}>
        <div className={styles.mapInner}>
          <span className={styles.mapTag}>{t("mapTag")}</span>
          <div ref={mapRef} className={styles.mapPlaceholder} />
        </div>
      </section>
    </SmoothScroll>
  );
}
