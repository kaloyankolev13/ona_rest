"use client";

import { useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ShevitsaDecor.module.css";

import animal1 from "@/assets/shevitsa/animals/animal1.svg";
import animal2 from "@/assets/shevitsa/animals/animal2.svg";
import animal3 from "@/assets/shevitsa/animals/animal3.svg";
import animal4 from "@/assets/shevitsa/animals/animal4.svg";
import animal5 from "@/assets/shevitsa/animals/animal5.svg";
import animal6 from "@/assets/shevitsa/animals/animal6.svg";
import animal7 from "@/assets/shevitsa/animals/animal7.svg";
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
    { src: animal1, top: "3%", right: "10%", size: 170, rotate: 18, speed: -250, opacity: 0.3 },
    { src: shevitsa, top: "20%", left: "8%", size: 180, rotate: -8, speed: 200, opacity: 0.1 },
    { src: animal4, bottom: "6%", left: "12%", size: 150, rotate: -25, speed: 300, opacity: 0.28 },
    { src: animal2, bottom: "15%", right: "15%", size: 140, rotate: 40, speed: -180, opacity: 0.25 },
    { src: shevitsa, top: "55%", right: "6%", size: 160, rotate: 15, speed: -220, opacity: 0.08 },
  ],
  2: [
    { src: animal2, top: "5%", left: "10%", size: 160, rotate: 30, speed: -220, opacity: 0.3 },
    { src: shevitsa, top: "15%", right: "8%", size: 170, rotate: -5, speed: 180, opacity: 0.09 },
    { src: animal3, top: "45%", right: "12%", size: 145, rotate: -12, speed: 280, opacity: 0.26 },
    { src: shevitsa, top: "35%", left: "5%", size: 150, rotate: 20, speed: -260, opacity: 0.08 },
    { src: animal5, bottom: "3%", left: "15%", size: 140, rotate: 42, speed: -320, opacity: 0.25 },
    { src: animal6, bottom: "12%", right: "18%", size: 135, rotate: -35, speed: 240, opacity: 0.22 },
  ],
  3: [
    { src: animal4, top: "6%", right: "12%", size: 150, rotate: -22, speed: 240, opacity: 0.3 },
    { src: shevitsa, top: "25%", left: "6%", size: 165, rotate: 10, speed: -200, opacity: 0.09 },
    { src: animal7, bottom: "5%", left: "10%", size: 160, rotate: 35, speed: -280, opacity: 0.28 },
    { src: animal1, top: "40%", right: "18%", size: 130, rotate: 50, speed: 180, opacity: 0.24 },
    { src: shevitsa, bottom: "10%", right: "8%", size: 145, rotate: -12, speed: 220, opacity: 0.08 },
  ],
  4: [
    { src: animal3, top: "8%", left: "12%", size: 155, rotate: 14, speed: -200, opacity: 0.28 },
    { src: animal5, top: "5%", right: "10%", size: 150, rotate: -30, speed: 260, opacity: 0.3 },
    { src: shevitsa, top: "30%", left: "6%", size: 155, rotate: 8, speed: 190, opacity: 0.09 },
    { src: animal6, bottom: "10%", right: "15%", size: 140, rotate: 38, speed: -240, opacity: 0.25 },
    { src: shevitsa, bottom: "5%", right: "8%", size: 140, rotate: -18, speed: -170, opacity: 0.07 },
  ],
  5: [
    { src: animal6, top: "10%", right: "12%", size: 155, rotate: 22, speed: -250, opacity: 0.27 },
    { src: shevitsa, top: "18%", left: "8%", size: 170, rotate: -6, speed: 210, opacity: 0.09 },
    { src: animal2, bottom: "8%", left: "12%", size: 145, rotate: -18, speed: 290, opacity: 0.3 },
    { src: animal7, top: "50%", right: "15%", size: 135, rotate: 45, speed: -200, opacity: 0.24 },
    { src: shevitsa, bottom: "3%", right: "10%", size: 135, rotate: 14, speed: 230, opacity: 0.08 },
  ],
  6: [
    { src: animal1, top: "6%", right: "14%", size: 150, rotate: -14, speed: 220, opacity: 0.3 },
    { src: shevitsa, top: "22%", right: "6%", size: 160, rotate: 10, speed: -190, opacity: 0.09 },
    { src: animal3, bottom: "4%", left: "12%", size: 160, rotate: 28, speed: -270, opacity: 0.28 },
    { src: animal5, top: "45%", left: "10%", size: 130, rotate: -40, speed: 200, opacity: 0.25 },
    { src: shevitsa, bottom: "8%", left: "6%", size: 145, rotate: -8, speed: 240, opacity: 0.07 },
  ],
  7: [
    { src: animal7, top: "4%", left: "10%", size: 155, rotate: 20, speed: -230, opacity: 0.29 },
    { src: shevitsa, top: "20%", right: "8%", size: 155, rotate: -12, speed: 200, opacity: 0.09 },
    { src: animal4, bottom: "6%", right: "12%", size: 150, rotate: -26, speed: 260, opacity: 0.27 },
    { src: animal2, top: "55%", left: "14%", size: 135, rotate: 32, speed: -180, opacity: 0.24 },
    { src: shevitsa, bottom: "3%", left: "8%", size: 140, rotate: 16, speed: -210, opacity: 0.08 },
  ],
  8: [
    { src: animal5, top: "8%", right: "10%", size: 145, rotate: 35, speed: -190, opacity: 0.28 },
    { src: shevitsa, top: "15%", left: "6%", size: 165, rotate: 6, speed: 220, opacity: 0.09 },
    { src: animal3, bottom: "10%", left: "14%", size: 155, rotate: -20, speed: 250, opacity: 0.26 },
    { src: animal6, top: "50%", right: "16%", size: 130, rotate: -42, speed: -200, opacity: 0.22 },
    { src: shevitsa, bottom: "5%", right: "8%", size: 150, rotate: -10, speed: 180, opacity: 0.07 },
  ],
  9: [
    { src: animal4, top: "5%", left: "10%", size: 155, rotate: -10, speed: -240, opacity: 0.3 },
    { src: shevitsa, top: "25%", right: "6%", size: 170, rotate: 8, speed: 190, opacity: 0.09 },
    { src: animal1, bottom: "4%", right: "12%", size: 150, rotate: 32, speed: 280, opacity: 0.28 },
    { src: animal7, top: "42%", left: "14%", size: 135, rotate: -28, speed: -180, opacity: 0.24 },
    { src: shevitsa, bottom: "8%", left: "8%", size: 145, rotate: -14, speed: 230, opacity: 0.08 },
  ],
  10: [
    { src: animal3, top: "4%", right: "14%", size: 160, rotate: 16, speed: -260, opacity: 0.29 },
    { src: shevitsa, top: "18%", left: "6%", size: 160, rotate: -6, speed: 210, opacity: 0.09 },
    { src: animal6, bottom: "6%", left: "10%", size: 150, rotate: -28, speed: 300, opacity: 0.27 },
    { src: animal2, top: "48%", right: "15%", size: 140, rotate: 36, speed: -190, opacity: 0.25 },
    { src: shevitsa, bottom: "4%", right: "8%", size: 150, rotate: 12, speed: -220, opacity: 0.07 },
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
