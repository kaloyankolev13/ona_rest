"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animateLettersOnScroll,
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import animStyles from "@/animations/animations.module.css";
import styles from "./HeritageSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const HEADING = "Where cultural heritage meets culinary excellence";
const DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function splitToLetters(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={className}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export function HeritageSection() {
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
      <div className={styles.layout}>
        {/* Left image */}
        <div className={styles.leftImages}>
          <div className={`${styles.imgSlot} ${styles.imgTall}`} />
        </div>

        {/* Center text */}
        <div className={styles.center}>
          <h2 ref={headingRef} className={styles.heading}>
            {splitToLetters(HEADING, animStyles.letter)}
          </h2>
          <p ref={descRef} className={styles.description}>
            {DESCRIPTION}
          </p>
        </div>

        {/* Right images */}
        <div className={styles.rightImages}>
          <div className={`${styles.imgSlot} ${styles.imgTop}`} />
          <div className={`${styles.imgSlot} ${styles.imgBottom}`} />
        </div>
      </div>
    </section>
  );
}
