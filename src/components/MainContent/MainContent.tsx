"use client";

import Image from "next/image";
import styles from "./MainContent.module.css";

interface MainContentProps {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function MainContent({
  title = "ONA",
  imageSrc,
  imageAlt = "Featured image",
}: MainContentProps) {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.left}>
          <h1 className={styles.title}>{title}</h1>
        </div>
        <div className={styles.right}>
          <div className={styles.imageWrapper}>
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className={styles.image}
                priority
              />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
