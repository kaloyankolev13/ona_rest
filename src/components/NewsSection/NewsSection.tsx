"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
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

function splitToLetters(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={className}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

const SLOT_CLASSES = ["imgA", "imgB", "imgC", "imgD", "imgE", "imgF"];

interface NewsArticle {
  _id: string;
  image: string;
}

export function NewsSection() {
  const t = useTranslations("NewsSection");
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    fetch("/api/news?published=true")
      .then((res) => res.json())
      .then((data: NewsArticle[]) => setArticles(data.slice(0, 6)))
      .catch(() => {});
  }, []);

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
  }, [articles]);

  const slots = SLOT_CLASSES.map((className, i) => ({
    id: i + 1,
    className,
    article: articles[i] ?? null,
  }));

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.canvas}>
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`${styles.imgSlot} ${styles[slot.className]}`}
          >
            {slot.article?.image ? (
              <Image
                src={slot.article.image}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                sizes="35vw"
              />
            ) : (
              <div className={styles.imgPlaceholder}>
                <span className={styles.imgLabel}>{slot.id}</span>
              </div>
            )}
          </div>
        ))}

        <div className={styles.centerBlock}>
          <h2 ref={titleRef} className={styles.title}>
            {splitToLetters(t("title"), animStyles.letter)}
          </h2>
          <Link href="/news" className={styles.newsBtn}>
            {t("seeAllNews")} <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
