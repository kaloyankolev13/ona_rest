"use client";

import styles from "../../Admin.module.css";
import NewsForm from "../NewsForm";

export default function NewArticlePage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>New Article</h2>
      </div>
      <NewsForm />
    </>
  );
}
