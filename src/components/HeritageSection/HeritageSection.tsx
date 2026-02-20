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
import styles from "./HeritageSection.module.css";

gsap.registerPlugin(ScrollTrigger);

function splitToLetters(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={className}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export function HeritageSection() {
  const t = useTranslations("HeritageSection");
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ownerRef = useRef<HTMLDivElement>(null);
  const ownerPhotoRef = useRef<HTMLDivElement>(null);
  const ownerTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Heading: letter-by-letter reveal
      if (headingRef.current) {
        animateLettersOnScroll(
          headingRef.current,
          `.${animStyles.letter}`,
          { stagger: 0.02, duration: 0.35 }
        );
      }

      // Description: fade in whole after heading
      if (descRef.current) {
        animateRevealOnScroll(descRef.current, {
          y: 30,
          duration: 0.6,
          delay: 0.8,
        });
      }

      // Images: pop up on scroll
      const images = section.querySelectorAll(`.${styles.imgSlot}`);
      if (images.length) {
        animateRevealOnScroll(images, {
          y: 80,
          duration: 0.8,
          stagger: 0.25,
          delay: 0.1,
        });
      }

      // Owner photo: reveal + parallax
      if (ownerPhotoRef.current) {
        animateRevealOnScroll(ownerPhotoRef.current, {
          y: 80,
          duration: 0.8,
        });
        gsap.fromTo(
          ownerPhotoRef.current,
          { yPercent: 0 },
          {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
              trigger: ownerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Owner text: staggered reveal
      if (ownerTextRef.current) {
        const textChildren = Array.from(ownerTextRef.current.children);
        if (textChildren.length) {
          animateRevealOnScroll(textChildren, {
            y: 40,
            duration: 0.6,
            stagger: 0.15,
            delay: 0.2,
          });
        }
      }

      // Parallax: images drift at different speeds on scroll (uses yPercent to avoid conflict with reveal's y)
      const parallaxSpeeds = [-20, 25, -15];
      images.forEach((img, i) => {
        gsap.fromTo(
          img,
          { yPercent: 0 },
          {
            yPercent: parallaxSpeeds[i % parallaxSpeeds.length],
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.layout}>
        {/* Left image */}
        <div className={styles.leftImages}>
          <div className={`${styles.imgSlot} ${styles.imgTall}`} />
        </div>

        {/* Center text */}
        <div className={styles.center}>
          <h2 ref={headingRef} className={styles.heading}>
            {splitToLetters(t("heading"), animStyles.letter)}
          </h2>
          <p ref={descRef} className={styles.description}>
            {t("description")}
          </p>
        </div>

        {/* Right images */}
        <div className={styles.rightImages}>
          <div className={`${styles.imgSlot} ${styles.imgTop}`} />
          <div className={`${styles.imgSlot} ${styles.imgBottom}`} />
        </div>
      </div>

      {/* ── Owner block ── */}
      <div ref={ownerRef} className={styles.ownerBlock}>
        <div ref={ownerPhotoRef} className={styles.ownerPhoto}>
          <div className={styles.ownerPhotoPlaceholder} />
        </div>
        <div ref={ownerTextRef} className={styles.ownerText}>
          <span className={styles.ownerTag}>{t("ownerTag")}</span>
          <h3 className={styles.ownerName}>{t("ownerName")}</h3>
          <span className={styles.ownerRole}>{t("ownerRole")}</span>
          <p className={styles.ownerDesc}>{t("ownerDesc1")}</p>
          <p className={styles.ownerDesc}>{t("ownerDesc2")}</p>
        </div>
      </div>
    </section>
  );
}
