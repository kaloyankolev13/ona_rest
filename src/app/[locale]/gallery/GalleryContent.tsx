"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SmoothScroll } from "@/components";
import { ShevitsaDecor } from "@/components/ShevitsaDecor/ShevitsaDecor";
import styles from "./Gallery.module.css";

gsap.registerPlugin(ScrollTrigger);

interface Photo {
  _id: string;
  image: string;
}

const LAYOUT_PATTERNS = [
  { colSpan: 2, rowSpan: 2, rotate: -1.5 },
  { colSpan: 1, rowSpan: 1, rotate: 1.2 },
  { colSpan: 1, rowSpan: 2, rotate: -0.8 },
  { colSpan: 1, rowSpan: 1, rotate: 2 },
  { colSpan: 2, rowSpan: 1, rotate: -1 },
  { colSpan: 1, rowSpan: 1, rotate: 0.5 },
  { colSpan: 1, rowSpan: 1, rotate: -2 },
  { colSpan: 1, rowSpan: 2, rotate: 1 },
];

export default function GalleryContent({ photos }: { photos: Photo[] }) {
  const t = useTranslations("GalleryPage");
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
        const items = gridRef.current.querySelectorAll(`.${styles.item}`);
        items.forEach((item, i) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 50, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none none",
              },
              delay: (i % 4) * 0.08,
            }
          );
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      <section className={styles.hero}>
        <ShevitsaDecor variant={4} />
        <span className={styles.heroSubtitle}>{t("heroSubtitle")}</span>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>
          {t("heroTitle")}
        </h1>
      </section>

      <section className={styles.gallery}>
        <ShevitsaDecor variant={9} />
        <div className={styles.galleryInner}>
          {photos.length === 0 ? (
            <p className={styles.empty}>No photos yet.</p>
          ) : (
            <div ref={gridRef} className={styles.grid}>
              {photos.map((photo, i) => {
                const pattern = LAYOUT_PATTERNS[i % LAYOUT_PATTERNS.length];
                return (
                  <div
                    key={photo._id}
                    className={styles.item}
                    style={{
                      gridColumn: `span ${pattern.colSpan}`,
                      gridRow: `span ${pattern.rowSpan}`,
                      transform: `rotate(${pattern.rotate}deg)`,
                    }}
                  >
                    <img
                      src={photo.image}
                      alt=""
                      className={styles.photo}
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SmoothScroll>
  );
}
