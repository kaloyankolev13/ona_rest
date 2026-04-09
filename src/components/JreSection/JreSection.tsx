"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./JreSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const JRE_URL = "https://jre.eu/en/restaurants/ona-rest";

export function JreSection() {
  const t = useTranslations("JreSection");
  const sectionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <a
          ref={logoRef}
          href={JRE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.logoLink}
          aria-label="JRE – Jeunes Restaurateurs"
        >
          <Image
            src="/jre.svg"
            alt="JRE – Jeunes Restaurateurs"
            width={120}
            height={60}
            className={styles.logo}
          />
        </a>

        <div ref={textRef} className={styles.textBlock}>
          <p className={styles.label}>{t("label")}</p>
          <h2 className={styles.heading}>{t("heading")}</h2>
          <p className={styles.description}>{t("description")}</p>
          <a
            href={JRE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {t("cta")} <span className={styles.arrow}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
