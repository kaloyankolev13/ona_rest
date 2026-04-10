import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { name, email, phone, date, guests, notes } = await request.json();

    if (!name || !email || !phone || !date || !guests) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    await connectDB();
    await Booking.create({ name, email, phone, date, guests, notes });

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
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px 12px;font-weight:bold;color:#072b16">Name</td><td style="padding:8px 12px">${name}</td></tr>
              <tr style="background:#f9f9f6"><td style="padding:8px 12px;font-weight:bold;color:#072b16">Email</td><td style="padding:8px 12px">${email}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:bold;color:#072b16">Phone</td><td style="padding:8px 12px">${phone}</td></tr>
              <tr style="background:#f9f9f6"><td style="padding:8px 12px;font-weight:bold;color:#072b16">Date</td><td style="padding:8px 12px">${date}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:bold;color:#072b16">Guests</td><td style="padding:8px 12px">${guests}</td></tr>
              ${notes ? `<tr style="background:#f9f9f6"><td style="padding:8px 12px;font-weight:bold;color:#072b16">Notes</td><td style="padding:8px 12px">${notes.replace(/\n/g, "<br />")}</td></tr>` : ""}
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
            <h2 style="color:#072b16">Thank you, ${name}!</h2>
            <p>We have received your reservation request. We will confirm availability and get back to you shortly.</p>
            <hr style="border:none;border-top:1px solid #ccc" />
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Guests:</strong> ${guests}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes.replace(/\n/g, "<br />")}</p>` : ""}
            <hr style="border:none;border-top:1px solid #ccc" />
            <p style="font-size:13px;color:#999">ONÀ — Стакевци, ул. 31 №1</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Booking email failed (saved to DB):", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to submit reservation" },
      { status: 500 }
    );
  }
}
