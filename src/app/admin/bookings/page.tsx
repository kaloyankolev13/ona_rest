"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../Admin.module.css";

interface BookingRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  notes: string;
  read: boolean;
  createdAt: string;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(viewMonth: Date) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Monday-start: convert Sun=0..Sat=6 → Mon=0..Sun=6
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - leadingBlanks);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchBookings = async () => {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const todayKey = formatDayKey(new Date());

  const bookingsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of bookings) {
      map[b.date] = (map[b.date] ?? 0) + 1;
    }
    return map;
  }, [bookings]);

  const monthDays = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const filteredBookings = useMemo(
    () => (selectedDate ? bookings.filter((b) => b.date === selectedDate) : bookings),
    [bookings, selectedDate]
  );

  const monthLabel = viewMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const goPrevMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNextMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const handleDayClick = (key: string) => {
    setSelectedDate((prev) => (prev === key ? null : key));
  };

  const toggleRead = async (b: BookingRow) => {
    await fetch(`/api/bookings/${b._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !b.read }),
    });
    setBookings((prev) =>
      prev.map((x) => (x._id === b._id ? { ...x, read: !x.read } : x))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
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

  const formatLongDate = (key: string) =>
    new Date(key).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatBookingDate = (key: string) =>
    new Date(key).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const unreadCount = bookings.filter((b) => !b.read).length;
  const viewMonthKey = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`;

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>
          Bookings{unreadCount > 0 && ` (${unreadCount} new)`}
        </h2>
      </div>

      <div className={styles.calendarCard}>
        <div className={styles.calendarHeader}>
          <div className={styles.calendarNav}>
            <button
              onClick={goPrevMonth}
              className={styles.calendarNavBtn}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              onClick={goNextMonth}
              className={styles.calendarNavBtn}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <div className={styles.calendarMonthLabel}>{monthLabel}</div>
          <div className={styles.calendarActions}>
            <button onClick={goToday} className={styles.calendarTodayBtn}>
              Today
            </button>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className={styles.calendarClearBtn}
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        <div className={styles.calendarGrid}>
          {WEEKDAYS.map((w) => (
            <div key={w} className={styles.calendarWeekday}>
              {w}
            </div>
          ))}
          {monthDays.map((d) => {
            const key = formatDayKey(d);
            const inMonth = key.startsWith(viewMonthKey);
            const count = bookingsByDate[key] ?? 0;
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            const cls = [
              styles.calendarDay,
              !inMonth ? styles.calendarDayOutside : "",
              isToday ? styles.calendarDayToday : "",
              count > 0 && !isSelected ? styles.calendarDayHasBookings : "",
              isSelected ? styles.calendarDaySelected : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div
                key={key}
                className={cls}
                onClick={() => handleDayClick(key)}
              >
                <span>{d.getDate()}</span>
                {count > 0 && (
                  <span
                    className={styles.calendarBookingCount}
                    aria-label={`${count} booking${count === 1 ? "" : "s"}`}
                  >
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className={styles.calendarFilterNote}>
          Showing bookings for{" "}
          <span className={styles.calendarFilterNoteValue}>
            {formatLongDate(selectedDate)}
          </span>
          {" — "}
          {filteredBookings.length} result
          {filteredBookings.length === 1 ? "" : "s"}
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : filteredBookings.length === 0 ? (
        <div className={styles.empty}>
          {selectedDate ? "No bookings for this date." : "No bookings yet."}
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Guests</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <>
                <tr
                  key={b._id}
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
                  <td>{formatBookingDate(b.date)}</td>
                  <td>{b.guests}</td>
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
                  <tr key={`${b._id}-body`}>
                    <td
                      colSpan={7}
                      style={{
                        padding: "1.5rem 2rem",
                        background: "rgba(7,43,22,0.02)",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        fontSize: "0.9rem",
                      }}
                    >
                      {b.notes ? b.notes : <em style={{ opacity: 0.5 }}>No notes</em>}
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
