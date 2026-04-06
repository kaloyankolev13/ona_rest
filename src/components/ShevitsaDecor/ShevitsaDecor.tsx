"use client";

import { useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ShevitsaDecor.module.css";

import flower1 from "@/assets/shevitsa/shevitsa-flower-1.svg";
import flower2 from "@/assets/shevitsa/shevitsa-flower-2.svg";
import flower3 from "@/assets/shevitsa/shevitsa-flower-3.svg";
import flower4 from "@/assets/shevitsa/shevitsa-flower-4.svg";
import shevitsa from "@/assets/shevitsa/shevitsa.svg";

gsap.registerPlugin(ScrollTrigger);

interface DecorationConfig {
  src: StaticImageData;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  rotate: number;
  speed: number;
  opacity: number;
}

const PRESETS: Record<number, DecorationConfig[]> = {
  1: [
    { src: flower1, top: "3%", right: "2%", size: 140, rotate: 18, speed: -250, opacity: 0.22 },
    { src: shevitsa, top: "20%", left: "1%", size: 180, rotate: -8, speed: 200, opacity: 0.1 },
    { src: flower4, bottom: "6%", left: "3%", size: 110, rotate: -25, speed: 300, opacity: 0.18 },
    { src: flower2, bottom: "15%", right: "4%", size: 90, rotate: 40, speed: -180, opacity: 0.14 },
    { src: shevitsa, top: "55%", right: "0%", size: 160, rotate: 15, speed: -220, opacity: 0.08 },
  ],
  2: [
    { src: flower2, top: "5%", left: "2%", size: 130, rotate: 30, speed: -220, opacity: 0.2 },
    { src: shevitsa, top: "15%", right: "1%", size: 170, rotate: -5, speed: 180, opacity: 0.09 },
    { src: flower3, top: "45%", right: "2%", size: 105, rotate: -12, speed: 280, opacity: 0.16 },
    { src: shevitsa, top: "35%", left: "0%", size: 150, rotate: 20, speed: -260, opacity: 0.08 },
    { src: flower1, bottom: "3%", left: "5%", size: 95, rotate: 42, speed: -320, opacity: 0.14 },
    { src: flower4, bottom: "12%", right: "5%", size: 85, rotate: -35, speed: 240, opacity: 0.12 },
  ],
  3: [
    { src: flower4, top: "6%", right: "3%", size: 100, rotate: -22, speed: 240, opacity: 0.2 },
    { src: shevitsa, top: "25%", left: "0%", size: 165, rotate: 10, speed: -200, opacity: 0.09 },
    { src: flower2, bottom: "5%", left: "2%", size: 120, rotate: 35, speed: -280, opacity: 0.18 },
    { src: flower1, top: "40%", right: "5%", size: 80, rotate: 50, speed: 180, opacity: 0.13 },
    { src: shevitsa, bottom: "10%", right: "1%", size: 145, rotate: -12, speed: 220, opacity: 0.08 },
  ],
  4: [
    { src: flower3, top: "8%", left: "4%", size: 115, rotate: 14, speed: -200, opacity: 0.18 },
    { src: flower1, top: "5%", right: "3%", size: 100, rotate: -30, speed: 260, opacity: 0.2 },
    { src: shevitsa, top: "30%", left: "0%", size: 155, rotate: 8, speed: 190, opacity: 0.09 },
    { src: flower4, bottom: "10%", right: "6%", size: 90, rotate: 38, speed: -240, opacity: 0.14 },
    { src: shevitsa, bottom: "5%", right: "0%", size: 140, rotate: -18, speed: -170, opacity: 0.07 },
  ],
  5: [
    { src: flower4, top: "10%", right: "4%", size: 110, rotate: 22, speed: -250, opacity: 0.17 },
    { src: shevitsa, top: "18%", left: "1%", size: 170, rotate: -6, speed: 210, opacity: 0.09 },
    { src: flower2, bottom: "8%", left: "3%", size: 95, rotate: -18, speed: 290, opacity: 0.19 },
    { src: flower3, top: "50%", right: "3%", size: 85, rotate: 45, speed: -200, opacity: 0.13 },
    { src: shevitsa, bottom: "3%", right: "2%", size: 135, rotate: 14, speed: 230, opacity: 0.08 },
  ],
  6: [
    { src: flower1, top: "6%", right: "5%", size: 105, rotate: -14, speed: 220, opacity: 0.2 },
    { src: shevitsa, top: "22%", right: "0%", size: 160, rotate: 10, speed: -190, opacity: 0.09 },
    { src: flower3, bottom: "4%", left: "4%", size: 120, rotate: 28, speed: -270, opacity: 0.18 },
    { src: flower2, top: "45%", left: "2%", size: 80, rotate: -40, speed: 200, opacity: 0.14 },
    { src: shevitsa, bottom: "8%", left: "0%", size: 145, rotate: -8, speed: 240, opacity: 0.07 },
  ],
  7: [
    { src: flower2, top: "4%", left: "3%", size: 115, rotate: 20, speed: -230, opacity: 0.19 },
    { src: shevitsa, top: "20%", right: "1%", size: 155, rotate: -12, speed: 200, opacity: 0.09 },
    { src: flower4, bottom: "6%", right: "4%", size: 100, rotate: -26, speed: 260, opacity: 0.17 },
    { src: flower1, top: "55%", left: "4%", size: 85, rotate: 32, speed: -180, opacity: 0.13 },
    { src: shevitsa, bottom: "3%", left: "1%", size: 140, rotate: 16, speed: -210, opacity: 0.08 },
  ],
  8: [
    { src: flower1, top: "8%", right: "3%", size: 95, rotate: 35, speed: -190, opacity: 0.18 },
    { src: shevitsa, top: "15%", left: "0%", size: 165, rotate: 6, speed: 220, opacity: 0.09 },
    { src: flower3, bottom: "10%", left: "5%", size: 110, rotate: -20, speed: 250, opacity: 0.16 },
    { src: flower4, top: "50%", right: "5%", size: 80, rotate: -42, speed: -200, opacity: 0.12 },
    { src: shevitsa, bottom: "5%", right: "0%", size: 150, rotate: -10, speed: 180, opacity: 0.07 },
  ],
  9: [
    { src: flower4, top: "5%", left: "3%", size: 110, rotate: -10, speed: -240, opacity: 0.2 },
    { src: shevitsa, top: "25%", right: "0%", size: 170, rotate: 8, speed: 190, opacity: 0.09 },
    { src: flower2, bottom: "4%", right: "4%", size: 100, rotate: 32, speed: 280, opacity: 0.18 },
    { src: flower3, top: "42%", left: "2%", size: 85, rotate: -28, speed: -180, opacity: 0.13 },
    { src: shevitsa, bottom: "8%", left: "1%", size: 145, rotate: -14, speed: 230, opacity: 0.08 },
  ],
  10: [
    { src: flower3, top: "4%", right: "5%", size: 120, rotate: 16, speed: -260, opacity: 0.19 },
    { src: shevitsa, top: "18%", left: "0%", size: 160, rotate: -6, speed: 210, opacity: 0.09 },
    { src: flower1, bottom: "6%", left: "3%", size: 105, rotate: -28, speed: 300, opacity: 0.17 },
    { src: flower4, top: "48%", right: "3%", size: 90, rotate: 36, speed: -190, opacity: 0.14 },
    { src: shevitsa, bottom: "4%", right: "1%", size: 150, rotate: 12, speed: -220, opacity: 0.07 },
  ],
};

export function ShevitsaDecor({ variant = 1 }: { variant?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>(`.${styles.item}`);
    const configs = PRESETS[variant] ?? PRESETS[1];

    const ctx = gsap.context(() => {
      items.forEach((item, i) => {
        if (!configs[i]) return;
        gsap.to(item, {
          y: configs[i].speed,
          ease: "none",
          scrollTrigger: {
            trigger: container.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
    }, container);

    return () => ctx.revert();
  }, [variant]);

  const decorations = PRESETS[variant] ?? PRESETS[1];

  return (
    <div ref={containerRef} className={styles.container} aria-hidden>
      {decorations.map((d, i) => (
        <div
          key={i}
          className={styles.item}
          style={{
            top: d.top,
            bottom: d.bottom,
            left: d.left,
            right: d.right,
            width: d.size,
            height: d.size,
            transform: `rotate(${d.rotate}deg)`,
            opacity: d.opacity,
          }}
        >
          <Image src={d.src} alt="" fill style={{ objectFit: "contain" }} />
        </div>
      ))}
    </div>
  );
}

export { ShevitsaDecor as default };
