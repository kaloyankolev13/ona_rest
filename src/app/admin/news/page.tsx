"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../Admin.module.css";

interface NewsArticle {
  _id: string;
  title: { bg: string; en: string };
  image: string;
  published: boolean;
  createdAt: string;
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    const res = await fetch("/api/news");
    const data = await res.json();
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    await fetch(`/api/news/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a._id !== id));
  };

  const togglePublish = async (article: NewsArticle) => {
    const res = await fetch(`/api/news/${article._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !article.published }),
    });

    if (res.ok) {
      setArticles((prev) =>
        prev.map((a) =>
          a._id === article._id ? { ...a, published: !a.published } : a
        )
      );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>News Articles</h2>
        <Link href="/admin/news/new" className={styles.addBtn}>
          + Add Article
        </Link>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : articles.length === 0 ? (
        <div className={styles.empty}>
          No articles yet. Create your first one!
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article._id}>
                <td>
                  {article.image ? (
                    <img
                      src={article.image}
                      alt=""
                      className={styles.thumbnail}
                    />
                  ) : (
                    <div className={styles.thumbnail} />
                  )}
                </td>
                <td>{article.title.en || article.title.bg}</td>
                <td>{formatDate(article.createdAt)}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      article.published
                        ? styles.badgePublished
                        : styles.badgeDraft
                    }`}
                  >
                    {article.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => togglePublish(article)}
                      className={styles.actionBtn}
                    >
                      {article.published ? "Unpublish" : "Publish"}
                    </button>
                    <Link
                      href={`/admin/news/${article._id}`}
                      className={styles.actionBtn}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
