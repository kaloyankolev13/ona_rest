"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../Admin.module.css";
import NewsForm from "../NewsForm";

interface NewsData {
  title: { bg: string; en: string };
  excerpt: { bg: string; en: string };
  content: { bg: string; en: string };
  image: string;
  imagePublicId: string;
  published: boolean;
}

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then((res) => res.json())
      .then((article) => {
        setData({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          image: article.image,
          imagePublicId: article.imagePublicId,
          published: article.published,
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className={styles.empty}>Loading...</div>;
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Edit Article</h2>
      </div>
      {data && <NewsForm initialData={data} articleId={id} />}
    </>
  );
}
