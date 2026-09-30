import { claimSubmission } from "@/lib/form-abuse-store";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
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
    await secureSubmission(request, "contact", async (fields) => {
      const { name, email, subject, message } = fields as { name: string; email: string; subject: string; message: string };
      await connectDB();
      await Message.create({ name, email, subject, message });

      const ownerEmail = process.env.GMAIL_USER;

      try {
        await transporter.sendMail({
          from: `"ONÀ" <${ownerEmail}>`,
          to: ownerEmail,
          replyTo: email,
          subject: `[Contact] ${subject}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#072b16">New message from the contact form</h2>
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
              <hr style="border:none;border-top:1px solid #ccc" />
              <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
            </div>
          `,
        });

        await transporter.sendMail({
          from: `"ONÀ" <${ownerEmail}>`,
          to: email,
          subject: "We received your message — ONÀ",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#072b16">Thank you, ${escapeHtml(name)}!</h2>
              <p>We have received your message and will get back to you as soon as possible.</p>
              <hr style="border:none;border-top:1px solid #ccc" />
              <p style="color:#555"><strong>Your message:</strong></p>
              <p style="color:#555"><em>Subject: ${escapeHtml(subject)}</em></p>
              <p style="color:#555">${escapeHtml(message).replace(/\n/g, "<br />")}</p>
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
