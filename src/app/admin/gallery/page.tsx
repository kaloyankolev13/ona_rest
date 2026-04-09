"use client";

import { useEffect, useState, useRef } from "react";
import styles from "../Admin.module.css";

interface Photo {
  _id: string;
  image: string;
  imagePublicId: string;
  order: number;
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setPhotos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "ona-gallery");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) continue;

      const { url, publicId } = await uploadRes.json();

      const saveRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url, imagePublicId: publicId }),
      });

      if (saveRes.ok) {
        const photo = await saveRes.json();
        setPhotos((prev) => [...prev, photo]);
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Gallery</h2>
        <button
          className={styles.addBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "+ Add Photos"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={handleUpload}
        />
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : photos.length === 0 ? (
        <div className={styles.empty}>
          No photos yet. Upload your first ones!
        </div>
      ) : (
        <div className={styles.galleryGrid}>
          {photos.map((photo) => (
            <div key={photo._id} className={styles.galleryCard}>
              <img src={photo.image} alt="" />
              <div className={styles.galleryCardOverlay}>
                <button
                  className={styles.galleryDeleteBtn}
                  onClick={() => handleDelete(photo._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
