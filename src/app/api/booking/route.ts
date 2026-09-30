import { claimSubmission } from "@/lib/form-abuse-store";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { secureSubmission, SubmissionError } from "@/lib/form-security";
import { escapeHtml } from "@/lib/form-validation";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    await secureSubmission(request, "booking", async (fields) => {
      const { name, email, phone, date, guests, notes, time } = fields as { name: string; email: string; phone: string; date: string; guests: number; notes: string; time: string };
      await connectDB();
      await Booking.create({ name, email, phone, date, guests, notes, time });

      const ownerEmail = process.env.GMAIL_USER;

      try {
        await transporter.sendMail({
          from: `"ONÀ Reservations" <${ownerEmail}>`,
          to: ownerEmail,
          replyTo: email,
          subject: `[Booking] ${name} — ${date}, ${guests} guest${guests > 1 ? "s" : ""}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#072b16">New Reservation Request</h2>
              ${time ? `<p><strong>Time:</strong> ${escapeHtml(time)}</p>` : ""}
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px 12px;font-weight:bold;color:#072b16">Name</td><td style="padding:8px 12px">${escapeHtml(name)}</td></tr>
                <tr style="background:#f9f9f6"><td style="padding:8px 12px;font-weight:bold;color:#072b16">Email</td><td style="padding:8px 12px">${escapeHtml(email)}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#072b16">Phone</td><td style="padding:8px 12px">${escapeHtml(phone)}</td></tr>
                <tr style="background:#f9f9f6"><td style="padding:8px 12px;font-weight:bold;color:#072b16">Date</td><td style="padding:8px 12px">${escapeHtml(date)}</td></tr>
                <tr><td style="padding:8px 12px;font-weight:bold;color:#072b16">Guests</td><td style="padding:8px 12px">${guests}</td></tr>
                ${notes ? `<tr style="background:#f9f9f6"><td style="padding:8px 12px;font-weight:bold;color:#072b16">Notes</td><td style="padding:8px 12px">${escapeHtml(notes).replace(/\n/g, "<br />")}</td></tr>` : ""}
              </table>
            </div>
          `,
        });

        await transporter.sendMail({
          from: `"ONÀ Reservations" <${ownerEmail}>`,
          to: email,
          subject: "Your reservation request — ONÀ",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#072b16">Thank you, ${escapeHtml(name)}!</h2>
              <p>We have received your reservation request. We will confirm availability and get back to you shortly.</p>
              <hr style="border:none;border-top:1px solid #ccc" />
              <p><strong>Date:</strong> ${escapeHtml(date)}</p>
              ${time ? `<p><strong>Time:</strong> ${escapeHtml(time)}</p>` : ""}
              <p><strong>Guests:</strong> ${guests}</p>
              <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
              ${notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes).replace(/\n/g, "<br />")}</p>` : ""}
              <hr style="border:none;border-top:1px solid #ccc" />
              <p style="font-size:13px;color:#999">ONÀ — Стакевци, ул. 31 №1</p>
            </div>
          `,
        });
      } catch {
        console.error("Email delivery failed", { category: "email_failed" });
      }

    }, claimSubmission);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SubmissionError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: error.status === 429 ? { "Retry-After": "600" } : {} });
    }
    console.error("Form processing failed", { category: "processing_failed" });
    return NextResponse.json(
      { error: "Unable to submit form" },
      { status: 500 }
    );
  }
}
