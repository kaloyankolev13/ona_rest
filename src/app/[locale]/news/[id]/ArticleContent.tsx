"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Link } from "@/i18n/navigation";
import { SmoothScroll } from "@/components";
import styles from "./Article.module.css";

interface ArticleData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
}

interface ArticleContentProps {
  article: ArticleData;
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.1 }
        );
      }
      if (bodyRef.current) {
        gsap.fromTo(
          bodyRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.3 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      {/* Hero image */}
      <div className={styles.hero}>
        {article.image && (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className={styles.heroImage}
            priority
            sizes="100vw"
          />
        )}
        <div className={styles.heroOverlay} />
      </div>

      {/* Article */}
      <section className={styles.article}>
        <div className={styles.articleInner}>
          <div className={styles.meta}>
            <Link href="/news" className={styles.backLink}>
              <span className={styles.backArrow}>←</span> News
            </Link>
            <span className={styles.date}>{article.date}</span>
          </div>

          <h1 ref={titleRef} className={styles.title}>
            {article.title}
          </h1>

          <p className={styles.excerpt}>{article.excerpt}</p>

          <div ref={bodyRef} className={styles.content}>
            {article.content}
          </div>
        </div>
      </section>
    </SmoothScroll>
  );
}
