"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import houseImg from "@/assets/house.jpg";
import {
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import { ShevitsaDecor } from "@/components/ShevitsaDecor/ShevitsaDecor";
import styles from "./StorySection.module.css";

gsap.registerPlugin(ScrollTrigger);

export function StorySection() {
  const t = useTranslations("StorySection");
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const blocks = section.querySelectorAll(`.${styles.block}`);
      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      const accent = section.querySelectorAll(`.${styles.accent}`);
      accent.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      if (imageRef.current) {
        animateRevealOnScroll(imageRef.current, {
          y: 80,
          duration: 0.9,
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.story}>
      <ShevitsaDecor variant={1} />
      <div className={styles.inner}>
        <div ref={imageRef} className={styles.imageCol}>
          <Image
            src={houseImg}
            alt="ONÀ house in winter"
            width={800}
            height={1067}
            className={styles.image}
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>

        <div className={styles.textCol}>
          {/* ── Far away ── */}
          <div className={styles.chapter}>
            <h2 className={`${styles.poeticTitle} ${styles.block}`}>
              {t("farAwayTitle")}
            </h2>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("farAway1")}
            </p>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("farAway2")}
            </p>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("farAway3")}
            </p>
            <p className={`${styles.accentWord} ${styles.accent}`}>
              {t("farAway4")}
            </p>
          </div>

          {/* ── The house ── */}
          <div className={styles.chapter}>
            <h2 className={`${styles.poeticTitle} ${styles.block}`}>
              {t("houseTitle")}
            </h2>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("house1")}
            </p>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("house2")}
            </p>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("house3")}
            </p>
          </div>

          {/* ── The night ── */}
          <div className={styles.chapter}>
            <h2 className={`${styles.poeticTitle} ${styles.block}`}>
              {t("nightTitle")}
            </h2>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("night1")}
            </p>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("night2")}
            </p>
          </div>

          {/* ── What is ONA ── */}
          <div className={styles.chapter}>
            <h2 className={`${styles.poeticTitle} ${styles.block}`}>
              {t("whatIsTitle")}
            </h2>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("whatIs1")}
            </p>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("whatIs2")}
            </p>
            <p className={`${styles.poeticText} ${styles.block}`}>
              {t("whatIs3")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
