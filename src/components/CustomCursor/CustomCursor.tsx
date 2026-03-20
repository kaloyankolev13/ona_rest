"use client";

import { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.css";

const CLICKABLE_SELECTOR =
  'a, button, [role="button"], input[type="submit"], input[type="button"], select, label[for], [data-clickable], .clickable, summary';

const GEO_OFFSET_X = 50;
const GEO_OFFSET_Y = 50;

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const geometryRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -200, y: -200 });
  const geoPos = useRef({ x: -200, y: -200 });
  const rafId = useRef(0);

  const hoveringRef = useRef(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const cursor = cursorRef.current;
    const geometry = geometryRef.current;
    if (!cursor || !geometry) return;

    const checkHover = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      const hovering = !!el?.closest(CLICKABLE_SELECTOR);
      if (hovering !== hoveringRef.current) {
        hoveringRef.current = hovering;
        innerRef.current?.classList.toggle(styles.expanded, hovering);
        arrowRef.current?.classList.toggle(styles.arrowVisible, hovering);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      checkHover(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
      cursor.style.opacity = "0";
      geometry.style.opacity = "0";
    };

    const onMouseEnter = () => {
      cursor.style.opacity = "1";
      geometry.style.opacity = "1";
    };

    const animate = () => {
      const ease = 0.1;
      geoPos.current.x += (mousePos.current.x - geoPos.current.x) * ease;
      geoPos.current.y += (mousePos.current.y - geoPos.current.y) * ease;

      geometry.style.left = `${geoPos.current.x + GEO_OFFSET_X}px`;
      geometry.style.top = `${geoPos.current.y + GEO_OFFSET_Y}px`;

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        onMouseLeave,
      );
      document.documentElement.removeEventListener(
        "mouseenter",
        onMouseEnter,
      );
      cancelAnimationFrame(rafId.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cursor.svg" alt="" width={20} height={20} draggable={false} />
      </div>

      <div ref={geometryRef} className={styles.geometry} aria-hidden="true">
        <div ref={innerRef} className={styles.inner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bg_geometry.svg"
            alt=""
            className={styles.spinImg}
            draggable={false}
          />
        </div>
        <div ref={arrowRef} className={styles.arrow}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="#d81a26"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
