export const EMAIL_RE = /^[^\s@<>",;\r\n]+@[^\s@<>",;\r\n]+\.[^\s@<>",;\r\n]+$/;
export const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;
export const TIMEZONE = "Europe/Sofia";
export function validBookingDate(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T12:00:00Z");
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  const today = part("year") + "-" + part("month") + "-" + part("day");
  const last = new Date(today + "T12:00:00Z");
  last.setUTCDate(last.getUTCDate() + 366);
  return value >= today && value <= last.toISOString().slice(0, 10);
}
export class FormError extends Error {}
export function validateFields(form: "contact" | "booking", body: Record<string, unknown>) {
  const text = (key: string, min: number, max: number, optional = false) => {
    const raw = body[key];
    if (raw === undefined && optional) return "";
    if (typeof raw !== "string") throw new FormError("Invalid " + key);
    const value = raw.trim();
    if ((value.length < min && !(optional && !value)) || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new FormError("Invalid " + key);
    if (!["message", "notes"].includes(key) && /[\r\n\t]/.test(value)) throw new FormError("Invalid " + key);
    return value;
  };
  const name = text("name", 2, 100);
  const email = text("email", 3, 254);
  if (!EMAIL_RE.test(email)) throw new FormError("Invalid email address");
  const phone = text("phone", 7, 20, form === "contact");
  if (phone && (!PHONE_RE.test(phone) || phone.replace(/\D/g, "").length < 7)) throw new FormError("Invalid phone number");
  if (form === "contact") return { name, email, phone, subject: text("subject", 1, 200, true), message: text("message", 5, 5000) };
  const guests = body.guests;
  if (typeof guests !== "number" || !Number.isInteger(guests) || guests < 1 || guests > 7) throw new FormError("Please choose a valid guest option");
  const date = text("date", 10, 10);
  if (!validBookingDate(date)) throw new FormError("Please choose a date from today through the next year");
  const time = text("time", 5, 5, true);
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new FormError("Invalid booking time");
  return { name, email, phone, date, guests, time, notes: text("notes", 0, 2000, true) };
}
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}
