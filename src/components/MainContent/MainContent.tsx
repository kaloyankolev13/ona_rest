"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import mainContentImg from "@/assets/main_content_img.jpeg";
import styles from "./MainContent.module.css";

interface MainContentProps {
  title2?: string;
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function MainContent({
  title2,
  title,
  imageSrc,
  imageAlt,
}: MainContentProps) {
  const t = useTranslations("MainContent");
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={imageSrc || mainContentImg}
              alt={imageAlt ?? t("imageAlt")}
              fill
              className={styles.image}
              priority
            />
          </div>
        </div>
        <div className={styles.textSection}>
          <div className={styles.titleGroup}>
            <span className={styles.title2}>{title2 ?? t("title2")}</span>
            <h1 className={styles.title}>{title ?? t("title")}</h1>
          </div>
        </div>
      </div>
    </main>
  );
}
