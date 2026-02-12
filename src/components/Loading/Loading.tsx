"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Loading.module.css";
import bgGeometry from "@/assets/bg_geometry.svg";
import logoOna from "@/assets/logo-ona.svg";

interface LoadingProps {
  duration?: number;
  onLoadingComplete?: () => void;
}

export function Loading({
  duration = 3000,
  onLoadingComplete,
}: LoadingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldSlideUp, setShouldSlideUp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldSlideUp(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (shouldSlideUp) {
      // Wait for slide animation to complete before hiding
      const hideTimer = setTimeout(() => {
        setIsLoading(false);
        onLoadingComplete?.();
      }, 800); // Match the CSS transition duration

      return () => clearTimeout(hideTimer);
    }
  }, [shouldSlideUp, onLoadingComplete]);

  if (!isLoading) return null;

  return (
    <div
      className={`${styles.container} ${shouldSlideUp ? styles.slideUp : ""}`}
    >
      <div className={styles.spinnerWrapper}>
        <Image
          src={bgGeometry}
          alt=""
          className={styles.spinner}
          width={400}
          height={400}
          priority
        />
        <Image
          src={logoOna}
          alt="ONA"
          className={styles.logo}
          width={316}
          height={316}
          priority
        />
      </div>
    </div>
  );
}
