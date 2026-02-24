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
import { SmoothScroll } from "@/components";
import styles from "./About.module.css";

gsap.registerPlugin(ScrollTrigger);

function splitToLetters(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={className}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export default function AboutPage() {
  const t = useTranslations("AboutPage");

  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const storyHeadingRef = useRef<HTMLHeadingElement>(null);
  const storyTextRef = useRef<HTMLDivElement>(null);
  const storyImageRef = useRef<HTMLDivElement>(null);
  const philRef = useRef<HTMLDivElement>(null);
  const philHeadingRef = useRef<HTMLHeadingElement>(null);
  const philTextRef = useRef<HTMLParagraphElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const teamHeadingRef = useRef<HTMLHeadingElement>(null);
  const teamTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 }
        );
      }

      if (storyHeadingRef.current) {
        animateLettersOnScroll(
          storyHeadingRef.current,
          `.${animStyles.letter}`,
          { stagger: 0.02, duration: 0.35 }
        );
      }

      if (storyTextRef.current) {
        animateRevealOnScroll(storyTextRef.current, {
          y: 40,
          duration: 0.7,
          delay: 0.4,
        });
      }

      if (storyImageRef.current) {
        animateRevealOnScroll(storyImageRef.current, {
          y: 80,
          duration: 0.9,
        });
      }

      if (philHeadingRef.current) {
        animateLettersOnScroll(
          philHeadingRef.current,
          `.${animStyles.letter}`,
          { stagger: 0.02, duration: 0.35 }
        );
      }

      if (philTextRef.current) {
        animateRevealOnScroll(philTextRef.current, {
          y: 30,
          duration: 0.6,
          delay: 0.6,
        });
      }

      if (valuesRef.current) {
        const cards = valuesRef.current.querySelectorAll(`.${styles.valueCard}`);
        if (cards.length) {
          animateRevealOnScroll(cards, {
            y: 60,
            duration: 0.7,
            stagger: 0.15,
          });
        }
      }

      if (teamHeadingRef.current) {
        animateLettersOnScroll(
          teamHeadingRef.current,
          `.${animStyles.letter}`,
          { stagger: 0.02, duration: 0.35 }
        );
      }

      if (teamTextRef.current) {
        animateRevealOnScroll(teamTextRef.current, {
          y: 40,
          duration: 0.7,
          delay: 0.3,
        });
      }

      if (teamRef.current) {
        const imgs = teamRef.current.querySelectorAll(`.${styles.teamImg}`);
        if (imgs.length) {
          animateRevealOnScroll(imgs, {
            y: 60,
            duration: 0.8,
            stagger: 0.2,
          });
        }
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      {/* Hero */}
      <section ref={heroRef} className={styles.hero}>
        <span className={styles.heroSubtitle}>{t("heroSubtitle")}</span>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>
          {t("heroTitle")}
        </h1>
      </section>

      {/* Story */}
      <section ref={storyRef} className={styles.story}>
        <div className={styles.storyInner}>
          <div ref={storyImageRef} className={styles.storyImage} />
          <div ref={storyTextRef} className={styles.storyText}>
            <h2 ref={storyHeadingRef} className={styles.storyHeading}>
              {splitToLetters(t("storyHeading"), animStyles.letter)}
            </h2>
            <p className={styles.storyParagraph}>{t("storyText1")}</p>
            <p className={styles.storyParagraph}>{t("storyText2")}</p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section ref={philRef} className={styles.philosophy}>
        <div className={styles.philosophyInner}>
          <span className={styles.tag}>{t("philosophyTag")}</span>
          <h2 ref={philHeadingRef} className={styles.philosophyHeading}>
            {splitToLetters(t("philosophyHeading"), animStyles.letter)}
          </h2>
          <p ref={philTextRef} className={styles.philosophyText}>
            {t("philosophyText")}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className={styles.values}>
        <div className={styles.valuesInner}>
          <span className={`${styles.tag} ${styles.tagDark}`}>
            {t("valuesTag")}
          </span>
          <div ref={valuesRef} className={styles.valuesGrid}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.valueCard}>
                <div className={styles.valueIcon} />
                <h3 className={styles.valueTitle}>
                  {t(`value${n}Title` as "value1Title")}
                </h3>
                <p className={styles.valueText}>
                  {t(`value${n}Text` as "value1Text")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section ref={teamRef} className={styles.team}>
        <div className={styles.teamInner}>
          <div ref={teamTextRef} className={styles.teamText}>
            <span className={styles.tag}>{t("teamTag")}</span>
            <h2 ref={teamHeadingRef} className={styles.teamHeading}>
              {splitToLetters(t("teamHeading"), animStyles.letter)}
            </h2>
            <p className={styles.teamParagraph}>{t("teamText")}</p>
          </div>
          <div className={styles.teamImages}>
            <div className={styles.teamImg} />
            <div className={styles.teamImg} />
            <div className={`${styles.teamImg} ${styles.teamImgWide}`} />
          </div>
        </div>
      </section>
    </SmoothScroll>
  );
}
