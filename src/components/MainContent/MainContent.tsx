"use client";

import Image from "next/image";
import mainContentImg from "@/assets/main_content_img.jpeg";
import styles from "./MainContent.module.css";

interface MainContentProps {
  title2?: string;
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function MainContent({
  title2= "RESTAURANT",
  title = "ONA",
  imageSrc,
  imageAlt = "Featured image",
}: MainContentProps) {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={imageSrc || mainContentImg}
              alt={imageAlt}
              fill
              className={styles.image}
              priority
            />
          </div>
        </div>
        <div className={styles.textSection}>
          <div className={styles.titleGroup}>
            <span className={styles.title2}>{title2}</span>
            <h1 className={styles.title}>{title}</h1>
          </div>
        </div>
      </div>
    </main>
  );
}
