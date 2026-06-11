import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import EventBooking from "@/models/EventBooking";
import { verifyTurnstile, getRemoteIp } from "@/lib/turnstile";

const EVENT_RECIPIENT = "kaloyan.kolev@hotmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { name, email, phone, message, captchaToken } = await request.json();

    if (!name || !email || !phone) {
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

    const captcha = await verifyTurnstile(
      captchaToken,
      getRemoteIp(request.headers)
    );
    if (!captcha.success) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    await connectDB();
    await EventBooking.create({
      event: "synhrona",
      name,
      email,
      phone,
      message: message ?? "",
    });

    const fromEmail = process.env.GMAIL_USER;

    try {
      await transporter.sendMail({
        from: `"синхрONÀ Applications" <${fromEmail}>`,
        to: EVENT_RECIPIENT,
        replyTo: email,
        subject: `[синхрONÀ] New application — ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#072b16">New синхрONÀ Application</h2>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px 12px;font-weight:bold;color:#072b16">Name</td><td style="padding:8px 12px">${name}</td></tr>
              <tr style="background:#f9f9f6"><td style="padding:8px 12px;font-weight:bold;color:#072b16">Email</td><td style="padding:8px 12px">${email}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:bold;color:#072b16">Phone</td><td style="padding:8px 12px">${phone}</td></tr>
              ${message ? `<tr style="background:#f9f9f6"><td style="padding:8px 12px;font-weight:bold;color:#072b16">Message</td><td style="padding:8px 12px">${String(message).replace(/\n/g, "<br />")}</td></tr>` : ""}
            </table>
          </div>
        `,
      });

      await transporter.sendMail({
        from: `"синхрONÀ" <${fromEmail}>`,
        to: email,
        subject: "Your application — синхрONÀ",
        html: `
          <div style="background:#0f1813;padding:40px 16px;font-family:Georgia,'Times New Roman',serif">
            <div style="max-width:560px;margin:0 auto;background:#142019;border:1px solid rgba(236,227,207,0.16);border-radius:14px;overflow:hidden">
              <div style="padding:40px 36px 0;text-align:center">
                <div style="display:inline-flex;align-items:center;gap:10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#a9c861;margin-bottom:28px">
                  Application Received
                </div>
                <h1 style="margin:0 0 6px;font-size:40px;line-height:1.1;font-weight:700;letter-spacing:-0.01em;color:#ece3cf">
                  синхр<span style="color:#a9c861">ONÀ</span>
                </h1>
                <p style="margin:18px 0 0;font-size:18px;font-style:italic;color:#d6ccb4">
                  Three days. One table.
                </p>
              </div>

              <div style="padding:32px 36px 8px;text-align:center">
                <h2 style="margin:0 0 14px;font-size:26px;font-weight:600;color:#ece3cf">Thank you, ${name}!</h2>
                <p style="margin:0;font-size:16px;line-height:1.7;color:#d6ccb4;font-family:Arial,Helvetica,sans-serif">
                  We have received your application for синхрONÀ. We'll be in touch very soon with more details about the programme.
                </p>
              </div>

              <div style="padding:28px 36px;font-family:Arial,Helvetica,sans-serif">
                <table style="width:100%;border-collapse:collapse;border-top:1px solid rgba(236,227,207,0.16)">
                  <tr>
                    <td style="padding:16px 0 0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(236,227,207,0.6);width:110px;vertical-align:top">Phone</td>
                    <td style="padding:16px 0 0;font-size:15px;color:#ece3cf">${phone}</td>
                  </tr>
                  ${message ? `<tr>
                    <td style="padding:14px 0 0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(236,227,207,0.6);width:110px;vertical-align:top">Message</td>
                    <td style="padding:14px 0 0;font-size:15px;color:#ece3cf;line-height:1.6">${String(message).replace(/\n/g, "<br />")}</td>
                  </tr>` : ""}
                </table>
              </div>

              <div style="padding:24px 36px 40px;text-align:center;border-top:1px solid rgba(236,227,207,0.16)">
                <p style="margin:24px 0 0;font-size:13px;letter-spacing:0.04em;color:rgba(236,227,207,0.6);font-family:Arial,Helvetica,sans-serif">
                  синхрONÀ · 29 June – 2 July 2026 · ONÀ, Stakevtsi
                </p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Event booking email failed (saved to DB):", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event booking error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
