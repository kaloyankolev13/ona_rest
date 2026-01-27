"use client";

import Image from "next/image";
import styles from "./Loading.module.css";
import bgGeometry from "@/assets/bg_geometry.svg";

interface LoadingProps {
  text?: string;
}

export function Loading({ text = "ONA" }: LoadingProps) {
  return (
    <div className={styles.container}>
      <div className={styles.spinnerWrapper}>
        <Image
          src={bgGeometry}
          alt=""
          className={styles.spinner}
          width={400}
          height={400}
          priority
        />
        <span className={styles.text}>{text}</span>
      </div>
    </div>
  );
}
