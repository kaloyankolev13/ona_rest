"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animateLettersOnScroll,
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import animStyles from "@/animations/animations.module.css";
import styles from "./TableSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const SLIDE_COUNT = 5;

function splitToLetters(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={className}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export function TableSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [current, setCurrent] = useState(0);
  const animating = useRef(false);

  const positionStack = useCallback(
    (startIndex: number) => {
      slidesRef.current.forEach((slide, i) => {
        if (!slide) return;
        const offset = (i - startIndex + SLIDE_COUNT) % SLIDE_COUNT;
        if (offset === 0) {
          gsap.set(slide, { x: 0, y: 0, rotation: 0, zIndex: SLIDE_COUNT, opacity: 1, scale: 1 });
        } else if (offset === 1) {
          gsap.set(slide, { x: 20, y: 20, rotation: 2, zIndex: SLIDE_COUNT - 1, opacity: 1, scale: 0.97 });
        } else if (offset === 2) {
          gsap.set(slide, { x: 40, y: 40, rotation: 4, zIndex: SLIDE_COUNT - 2, opacity: 0.7, scale: 0.94 });
        } else {
          gsap.set(slide, { x: 0, y: 0, rotation: 0, zIndex: 0, opacity: 0, scale: 0.9 });
        }
      });
    },
    []
  );

  const advance = useCallback(() => {
    if (animating.current) return;
    animating.current = true;

    const topSlide = slidesRef.current[current];
    if (!topSlide) {
      animating.current = false;
      return;
    }

    const nextIndex = (current + 1) % SLIDE_COUNT;

    // Swipe the top card off to the left
    gsap.to(topSlide, {
      x: -600,
      y: -100,
      rotation: -15,
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(topSlide, { x: 0, y: 0, rotation: 0, opacity: 0, scale: 0.9, zIndex: 0 });
        positionStack(nextIndex);
        setCurrent(nextIndex);
        animating.current = false;
      },
    });

    // Simultaneously animate the next cards up
    slidesRef.current.forEach((slide, i) => {
      if (!slide || i === current) return;
      const offset = (i - nextIndex + SLIDE_COUNT) % SLIDE_COUNT;
      if (offset === 0) {
        gsap.to(slide, { x: 0, y: 0, rotation: 0, zIndex: SLIDE_COUNT, scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" });
      } else if (offset === 1) {
        gsap.to(slide, { x: 20, y: 20, rotation: 2, zIndex: SLIDE_COUNT - 1, scale: 0.97, opacity: 1, duration: 0.5, ease: "power2.out" });
      } else if (offset === 2) {
        gsap.to(slide, { x: 40, y: 40, rotation: 4, zIndex: SLIDE_COUNT - 2, scale: 0.94, opacity: 0.7, duration: 0.5, ease: "power2.out" });
      }
    });
  }, [current, positionStack]);

  useEffect(() => {
    positionStack(0);
  }, [positionStack]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (numberRef.current) {
        animateLettersOnScroll(numberRef.current, `.${animStyles.letter}`, {
          stagger: 0.06,
          duration: 0.5,
        });
      }
      if (labelRef.current) {
        animateLettersOnScroll(labelRef.current, `.${animStyles.letter}`, {
          stagger: 0.04,
          duration: 0.4,
          delay: 0.2,
        });
      }
      if (galleryRef.current) {
        gsap.set(galleryRef.current, { yPercent: 30, opacity: 0 });
        gsap.to(galleryRef.current, {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
      if (descRef.current) {
        animateRevealOnScroll(descRef.current, {
          y: 40,
          duration: 0.7,
          delay: 0.6,
        });
      }

      // "1 TABLE" drifts to the right on scroll
      if (titleBlockRef.current) {
        gsap.fromTo(
          titleBlockRef.current,
          { xPercent: 0 },
          {
            xPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.topRow}>
          <div ref={galleryRef} className={styles.gallery} onClick={advance}>
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <div
                key={i}
                ref={(el) => { slidesRef.current[i] = el; }}
                className={styles.card}
              >
                <div className={styles.cardInner}>
                  <span className={styles.cardLabel}>{i + 1}</span>
                </div>
              </div>
            ))}
          </div>

          <div ref={titleBlockRef} className={styles.titleBlock}>
            <span ref={numberRef} className={styles.bigNumber}>
              {splitToLetters("1", animStyles.letter)}
            </span>
            <span ref={labelRef} className={styles.label}>
              {splitToLetters("TABLE", animStyles.letter)}
            </span>
          </div>
        </div>

        <div ref={descRef} className={styles.bottom}>
          <div className={styles.desc}>
            <p className={styles.descText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam.
            </p>
            <p className={styles.descText}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident.
            </p>
          </div>
          <button className={styles.menuBtn}>
            BOOK <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
