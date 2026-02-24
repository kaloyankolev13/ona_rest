"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../Admin.module.css";

interface NewsFormData {
  title: { bg: string; en: string };
  excerpt: { bg: string; en: string };
  content: { bg: string; en: string };
  image: string;
  imagePublicId: string;
  published: boolean;
}

interface NewsFormProps {
  initialData?: NewsFormData;
  articleId?: string;
}

const empty: NewsFormData = {
  title: { bg: "", en: "" },
  excerpt: { bg: "", en: "" },
  content: { bg: "", en: "" },
  image: "",
  imagePublicId: "",
  published: false,
};

export default function NewsForm({ initialData, articleId }: NewsFormProps) {
  const router = useRouter();
  const [data, setData] = useState<NewsFormData>(initialData ?? empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = !!articleId;

  const updateLocalized = (
    field: "title" | "excerpt" | "content",
    locale: "bg" | "en",
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [locale]: value },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();

      if (res.ok) {
        setData((prev) => ({
          ...prev,
          image: result.url,
          imagePublicId: result.publicId,
        }));
      }
    } catch {
      alert("Upload failed. Please try again.");
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = isEdit ? `/api/news/${articleId}` : "/api/news";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/news");
    } else {
      alert("Failed to save article.");
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formCard}>
        {/* Title */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Title</h3>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>English</label>
              <input
                type="text"
                className={styles.input}
                value={data.title.en}
                onChange={(e) => updateLocalized("title", "en", e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bulgarian</label>
              <input
                type="text"
                className={styles.input}
                value={data.title.bg}
                onChange={(e) => updateLocalized("title", "bg", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Excerpt</h3>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>English</label>
              <textarea
                className={styles.textarea}
                value={data.excerpt.en}
                onChange={(e) =>
                  updateLocalized("excerpt", "en", e.target.value)
                }
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bulgarian</label>
              <textarea
                className={styles.textarea}
                value={data.excerpt.bg}
                onChange={(e) =>
                  updateLocalized("excerpt", "bg", e.target.value)
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Full Content</h3>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>English</label>
              <textarea
                className={styles.textareaLarge}
                value={data.content.en}
                onChange={(e) =>
                  updateLocalized("content", "en", e.target.value)
                }
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bulgarian</label>
              <textarea
                className={styles.textareaLarge}
                value={data.content.bg}
                onChange={(e) =>
                  updateLocalized("content", "bg", e.target.value)
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Cover Image</h3>
          <div className={styles.imageUpload}>
            <div className={styles.imagePreview}>
              {data.image ? (
                <img src={data.image} alt="Preview" />
              ) : (
                <span className={styles.imagePreviewEmpty}>No image</span>
              )}
            </div>
            <div className={styles.imageActions}>
              <label className={styles.uploadBtn}>
                {uploading ? "Uploading..." : "Choose Image"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
              <span className={styles.uploadHint}>
                JPG, PNG or WebP. Max 5MB.
              </span>
            </div>
          </div>
        </div>

        {/* Publish toggle */}
        <div className={styles.toggleRow}>
          <button
            type="button"
            className={`${styles.toggle} ${data.published ? styles.toggleActive : ""}`}
            onClick={() => setData((prev) => ({ ...prev, published: !prev.published }))}
          >
            <span className={styles.toggleDot} />
          </button>
          <span className={styles.toggleLabel}>
            {data.published ? "Published" : "Draft"}
          </span>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
          </button>
          <a href="/admin/news" className={styles.cancelBtn}>
            Cancel
          </a>
        </div>
      </div>
    </form>
  );
}
