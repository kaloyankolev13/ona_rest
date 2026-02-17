"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animateLettersOnScroll,
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import animStyles from "@/animations/animations.module.css";
import styles from "./NewsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const TITLE = "News";

function splitToLetters(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={className}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

const IMAGES = [
  { id: 1, className: "imgA" },
  { id: 2, className: "imgB" },
  { id: 3, className: "imgC" },
  { id: 4, className: "imgD" },
  { id: 5, className: "imgE" },
  { id: 6, className: "imgF" },
];

export function NewsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        animateLettersOnScroll(titleRef.current, `.${animStyles.letter}`, {
          stagger: 0.05,
          duration: 0.5,
        });
      }

      const images = section.querySelectorAll(`.${styles.imgSlot}`);
      if (images.length) {
        animateRevealOnScroll(images, {
          y: 60,
          duration: 0.8,
          stagger: 0.15,
        });
      }

      // Parallax: each image drifts at a different speed on scroll (uses yPercent to avoid conflict with reveal's y)
      const parallaxSpeeds = [-25, 18, -30, 15, -22, 28];
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
      <div className={styles.canvas}>
        {IMAGES.map((img) => (
          <div
            key={img.id}
            className={`${styles.imgSlot} ${styles[img.className]}`}
          >
            <div className={styles.imgPlaceholder}>
              <span className={styles.imgLabel}>{img.id}</span>
            </div>
          </div>
        ))}

        <div className={styles.centerBlock}>
          <h2 ref={titleRef} className={styles.title}>
            {splitToLetters(TITLE, animStyles.letter)}
          </h2>
          <Link href="/news" className={styles.newsBtn}>
            See all news <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
