"use client";

import { Fragment, useEffect, useState } from "react";
import styles from "../Admin.module.css";

interface EventBookingRow {
  _id: string;
  event: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminEventBookingsPage() {
  const [bookings, setBookings] = useState<EventBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchBookings = async () => {
    const res = await fetch("/api/event-bookings");
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const toggleRead = async (b: EventBookingRow) => {
    await fetch(`/api/event-bookings/${b._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !b.read }),
    });
    setBookings((prev) =>
      prev.map((x) => (x._id === b._id ? { ...x, read: !x.read } : x))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    await fetch(`/api/event-bookings/${id}`, { method: "DELETE" });
    setBookings((prev) => prev.filter((b) => b._id !== id));
  };

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const unreadCount = bookings.filter((b) => !b.read).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>
          Event bookings{unreadCount > 0 && ` (${unreadCount} new)`}
        </h2>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : bookings.length === 0 ? (
        <div className={styles.empty}>No event applications yet.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Phone</th>
              <th>Event</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <Fragment key={b._id}>
                <tr
                  onClick={() =>
                    setExpanded(expanded === b._id ? null : b._id)
                  }
                  style={{
                    cursor: "pointer",
                    fontWeight: b.read ? "normal" : "600",
                  }}
                >
                  <td>
                    {b.name}
                    <br />
                    <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                      {b.email}
                    </span>
                  </td>
                  <td>{b.phone}</td>
                  <td>{b.event}</td>
                  <td>{formatDateTime(b.createdAt)}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        b.read ? styles.badgeDraft : styles.badgePublished
                      }`}
                    >
                      {b.read ? "Read" : "New"}
                    </span>
                  </td>
                  <td>
                    <div
                      className={styles.actions}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleRead(b)}
                        className={styles.actionBtn}
                      >
                        {b.read ? "Mark unread" : "Mark read"}
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === b._id && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "1.5rem 2rem",
                        background: "rgba(7,43,22,0.02)",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        fontSize: "0.9rem",
                      }}
                    >
                      {b.message ? (
                        b.message
                      ) : (
                        <em style={{ opacity: 0.5 }}>No message</em>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
