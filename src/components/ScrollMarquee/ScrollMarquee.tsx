"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ScrollMarquee.module.css";

gsap.registerPlugin(ScrollTrigger);

const REPEATS = 6;

function buildLine(
  segments: string[],
  repeats: number,
  cssStyles: Record<string, string>
) {
  const items: React.ReactNode[] = [];
  for (let r = 0; r < repeats; r++) {
    segments.forEach((seg, i) => {
      items.push(
        <span key={`${r}-${i}-t`} className={cssStyles.word}>{seg}</span>,
        <span key={`${r}-${i}-d`} className={cssStyles.dot} />,
      );
    });
  }
  return items;
}

export function ScrollMarquee() {
  const t = useTranslations("ScrollMarquee");
  const line1Segments = t.raw("line1Segments") as string[];
  const line2Segments = t.raw("line2Segments") as string[];
  const sectionRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(line1Ref.current, {
        xPercent: -2,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.to(line2Ref.current, {
        xPercent: 2,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.track}>
        <div ref={line1Ref} className={styles.line}>
          <span className={styles.text}>
            {buildLine(line1Segments, REPEATS, styles)}
          </span>
        </div>
      </div>

      <div className={styles.track}>
        <div ref={line2Ref} className={`${styles.line} ${styles.lineReverse}`}>
          <span className={styles.text}>
            {buildLine(line2Segments, REPEATS, styles)}
          </span>
        </div>
      </div>
    </section>
  );
}
