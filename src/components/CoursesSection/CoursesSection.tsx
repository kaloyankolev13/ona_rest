"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animateLettersOnScroll,
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import animStyles from "@/animations/animations.module.css";
import styles from "./CoursesSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const MOBILE_BREAKPOINT = 900;
const SLIDE_COUNT = 5;

function splitToLetters(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={className}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export function CoursesSection() {
  const t = useTranslations("CoursesSection");
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [current, setCurrent] = useState(0);
  const animating = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Position: main slot = left:0, peek slot = left:64%, hidden = off-screen
  const MAIN_LEFT = "0%";
  const PEEK_LEFT = "64%";
  const PEEK_WIDTH = "38%";
  const MAIN_WIDTH = "62%";
  const OFF_SCREEN = "110%";

  const positionSlide = useCallback(
    (slide: HTMLDivElement, role: "main" | "peek" | "hidden") => {
      if (role === "main") {
        gsap.set(slide, { left: MAIN_LEFT, width: MAIN_WIDTH, zIndex: 2, opacity: 1 });
      } else if (role === "peek") {
        gsap.set(slide, { left: PEEK_LEFT, width: PEEK_WIDTH, zIndex: 1, opacity: 1 });
      } else {
        gsap.set(slide, { left: OFF_SCREEN, width: PEEK_WIDTH, zIndex: 0, opacity: 0 });
      }
    },
    []
  );

  const advance = useCallback(() => {
    if (animating.current) return;
    animating.current = true;

    const nextIndex = (current + 1) % SLIDE_COUNT;
    const peekIndex = (current + 2) % SLIDE_COUNT;
    const currentSlide = slidesRef.current[current];
    const nextSlide = slidesRef.current[nextIndex];
    const peekSlide = slidesRef.current[peekIndex];

    if (!currentSlide || !nextSlide || !peekSlide) {
      animating.current = false;
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        positionSlide(currentSlide, "hidden");
        setCurrent(nextIndex);
        animating.current = false;
      },
    });

    // Current exits left
    tl.to(currentSlide, {
      left: "-62%",
      opacity: 0,
      duration: 0.7,
      ease: "power2.inOut",
    }, 0);

    // Peek moves into main position and grows
    tl.to(nextSlide, {
      left: MAIN_LEFT,
      width: MAIN_WIDTH,
      zIndex: 2,
      duration: 0.7,
      ease: "power2.inOut",
    }, 0);

    // New peek slides in from off-screen
    gsap.set(peekSlide, { left: OFF_SCREEN, width: PEEK_WIDTH, zIndex: 1, opacity: 1 });
    tl.to(peekSlide, {
      left: PEEK_LEFT,
      duration: 0.7,
      ease: "power2.inOut",
    }, 0);
  }, [current, positionSlide]);

  useEffect(() => {
    slidesRef.current.forEach((slide, i) => {
      if (!slide) return;
      if (i === 0) {
        positionSlide(slide, "main");
      } else if (i === 1) {
        positionSlide(slide, "peek");
      } else {
        positionSlide(slide, "hidden");
      }
    });
  }, [positionSlide]);

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
        gsap.set(galleryRef.current, { xPercent: 80, opacity: 0 });
        gsap.to(galleryRef.current, {
          xPercent: 0,
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

      // "12 COURSES" drifts on scroll (left on desktop, right on mobile)
      if (titleBlockRef.current) {
        gsap.fromTo(
          titleBlockRef.current,
          { xPercent: 0 },
          {
            xPercent: isMobile ? 20 : -20,
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
  }, [isMobile]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.layout}>
        {/* ── Top: title + gallery side by side ── */}
        <div className={styles.topRow}>
          <div ref={titleBlockRef} className={styles.titleBlock}>
            <span ref={numberRef} className={styles.bigNumber}>
              {splitToLetters(t("number"), animStyles.letter)}
            </span>
            <span ref={labelRef} className={styles.label}>
              {splitToLetters(t("label"), animStyles.letter)}
            </span>
          </div>

          <div ref={galleryRef} className={styles.gallery} onClick={advance}>
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <div
              key={i}
              ref={(el) => { slidesRef.current[i] = el; }}
              className={styles.slide}
            >
              <div className={styles.slidePlaceholder}>
                <span className={styles.slideLabel}>{i + 1}</span>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* ── Description below photos ── */}
        <div ref={descRef} className={styles.bottom}>
          <div className={styles.desc}>
            <p className={styles.descText}>{t("desc1")}</p>
            <p className={styles.descText}>{t("desc2")}</p>
          </div>
          <button className={styles.menuBtn}>
            {t("menuBtn")} <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
