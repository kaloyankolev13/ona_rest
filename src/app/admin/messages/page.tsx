"use client";

import { useEffect, useState } from "react";
import styles from "../Admin.module.css";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchMessages = async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleRead = async (msg: ContactMessage) => {
    await fetch(`/api/messages/${msg._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !msg.read }),
    });
    setMessages((prev) =>
      prev.map((m) => (m._id === msg._id ? { ...m, read: !m.read } : m))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m._id !== id));
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>
          Messages{unreadCount > 0 && ` (${unreadCount} new)`}
        </h2>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : messages.length === 0 ? (
        <div className={styles.empty}>No messages yet.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>From</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <>
                <tr
                  key={msg._id}
                  onClick={() =>
                    setExpanded(expanded === msg._id ? null : msg._id)
                  }
                  style={{
                    cursor: "pointer",
                    fontWeight: msg.read ? "normal" : "600",
                  }}
                >
                  <td>
                    {msg.name}
                    <br />
                    <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                      {msg.email}
                    </span>
                  </td>
                  <td>{msg.subject}</td>
                  <td>{formatDate(msg.createdAt)}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        msg.read ? styles.badgeDraft : styles.badgePublished
                      }`}
                    >
                      {msg.read ? "Read" : "New"}
                    </span>
                  </td>
                  <td>
                    <div
                      className={styles.actions}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleRead(msg)}
                        className={styles.actionBtn}
                      >
                        {msg.read ? "Mark unread" : "Mark read"}
                      </button>
                      <button
                        onClick={() => handleDelete(msg._id)}
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === msg._id && (
                  <tr key={`${msg._id}-body`}>
                    <td
                      colSpan={5}
                      style={{
                        padding: "1.5rem 2rem",
                        background: "rgba(7,43,22,0.02)",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        fontSize: "0.9rem",
                      }}
                    >
                      {msg.message}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
