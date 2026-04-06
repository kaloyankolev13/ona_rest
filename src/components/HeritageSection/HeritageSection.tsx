"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ona1 from "@/assets/ona_main/ona_1.jpg";
import ona2 from "@/assets/ona_main/ona_2.jpg";
import ona3 from "@/assets/ona_main/ona_3.jpg";
import {
  animateLettersOnScroll,
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import animStyles from "@/animations/animations.module.css";
import { ShevitsaDecor } from "@/components/ShevitsaDecor/ShevitsaDecor";
import styles from "./HeritageSection.module.css";

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

export function HeritageSection() {
  const t = useTranslations("HeritageSection");
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

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
      <ShevitsaDecor variant={2} />
      <div className={styles.layout}>
        {/* Left image */}
        <div className={styles.leftImages}>
          <div className={`${styles.imgSlot} ${styles.imgTall}`}>
            <Image src={ona1} alt="" width={600} height={800} className={styles.photo} sizes="(max-width: 900px) 90vw, 30vw" />
          </div>
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
          <div className={`${styles.imgSlot} ${styles.imgTop}`}>
            <Image src={ona2} alt="" width={600} height={750} className={styles.photo} sizes="(max-width: 900px) 90vw, 25vw" />
          </div>
          <div className={`${styles.imgSlot} ${styles.imgBottom}`}>
            <Image src={ona3} alt="" width={800} height={450} className={styles.photo} sizes="(max-width: 900px) 90vw, 25vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
