"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animateRevealOnScroll } from "@/animations/scrollAnimations";
import { SmoothScroll } from "@/components";
import styles from "./News.module.css";

gsap.registerPlugin(ScrollTrigger);

interface Article {
  _id: string;
  title: { bg: string; en: string };
  excerpt: { bg: string; en: string };
  image: string;
  createdAt: string;
}

interface NewsContentProps {
  articles: Article[];
  locale: string;
}

export default function NewsContent({ articles, locale }: NewsContentProps) {
  const t = useTranslations("NewsPage");

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const loc = locale as "bg" | "en";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(loc === "bg" ? "bg-BG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 }
        );
      }

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(`.${styles.card}`);
        if (cards.length) {
          animateRevealOnScroll(cards, {
            y: 60,
            duration: 0.7,
            stagger: 0.12,
          });
        }
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.heroSubtitle}>{t("heroSubtitle")}</span>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>
          {t("heroTitle")}
        </h1>
      </section>

      {/* Articles */}
      <section className={styles.articles}>
        <div className={styles.articlesInner}>
          {articles.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(51,51,51,0.5)", padding: "4rem 0" }}>
              {loc === "bg" ? "Няма новини все още." : "No news articles yet."}
            </p>
          ) : (
            <div ref={gridRef} className={styles.grid}>
              {articles.map((article, i) => (
                <Link
                  key={article._id}
                  href={`/news/${article._id}`}
                  className={`${styles.card} ${i === 0 ? styles.cardFeatured : ""}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className={styles.cardImage}>
                    {article.image && (
                      <Image
                        src={article.image}
                        alt={article.title[loc]}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes={i === 0 ? "55vw" : "50vw"}
                      />
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.cardDate}>
                      {formatDate(article.createdAt)}
                    </span>
                    <h3 className={styles.cardTitle}>{article.title[loc]}</h3>
                    <p className={styles.cardExcerpt}>{article.excerpt[loc]}</p>
                    <span className={styles.readMore}>
                      {t("readMore")}{" "}
                      <span className={styles.readMoreArrow}>→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SmoothScroll>
  );
}
