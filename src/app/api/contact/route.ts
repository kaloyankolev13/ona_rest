import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

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
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border:none;border-top:1px solid #ccc" />
            <p>${message.replace(/\n/g, "<br />")}</p>
          </div>
        `,
      });

      await transporter.sendMail({
        from: `"ONÀ" <${ownerEmail}>`,
        to: email,
        subject: "We received your message — ONÀ",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#072b16">Thank you, ${name}!</h2>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <hr style="border:none;border-top:1px solid #ccc" />
            <p style="color:#555"><strong>Your message:</strong></p>
            <p style="color:#555"><em>Subject: ${subject}</em></p>
            <p style="color:#555">${message.replace(/\n/g, "<br />")}</p>
            <hr style="border:none;border-top:1px solid #ccc" />
            <p style="font-size:13px;color:#999">ONÀ — Стакевци, ул. 31 №1</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed (message saved to DB):", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
