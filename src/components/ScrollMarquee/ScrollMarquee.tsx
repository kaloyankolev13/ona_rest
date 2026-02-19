"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ScrollMarquee.module.css";

gsap.registerPlugin(ScrollTrigger);

const LINE_1_SEGMENTS = [
  "Lorem Ipsum",
  "Dolor Sit Amet",
  "Consectetur Adipiscing",
  "Elit Sed Eiusmod",
];
const LINE_2_SEGMENTS = [
  "Tempor Incididunt",
  "Ut Labore Dolore",
  "Magna Aliqua",
  "Veniam Nostrud",
];

const REPEATS = 6;

function buildLine(segments: string[], repeats: number) {
  const items: React.ReactNode[] = [];
  for (let r = 0; r < repeats; r++) {
    segments.forEach((seg, i) => {
      items.push(
        <span key={`${r}-${i}-t`} className={styles.word}>{seg}</span>,
        <span key={`${r}-${i}-d`} className={styles.dot} />,
      );
    });
  }
  return items;
}

export function ScrollMarquee() {
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
            {buildLine(LINE_1_SEGMENTS, REPEATS)}
          </span>
        </div>
      </div>

      <div className={styles.track}>
        <div ref={line2Ref} className={`${styles.line} ${styles.lineReverse}`}>
          <span className={styles.text}>
            {buildLine(LINE_2_SEGMENTS, REPEATS)}
          </span>
        </div>
      </div>
    </section>
  );
}
