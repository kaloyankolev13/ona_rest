import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

function isAuthed(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  return session === process.env.ADMIN_SESSION_SECRET;
}

export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const bookings = await Booking.find().sort({ createdAt: -1 }).lean();

  return NextResponse.json(
    bookings.map((b) => ({
      _id: String(b._id),
      name: b.name,
      email: b.email,
      phone: b.phone,
      date: b.date,
      guests: b.guests,
      notes: b.notes,
      read: b.read,
      createdAt: b.createdAt.toISOString(),
    }))
  );
}
