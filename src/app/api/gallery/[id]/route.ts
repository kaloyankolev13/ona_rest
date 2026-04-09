import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import GalleryPhoto from "@/models/GalleryPhoto";
import cloudinary from "@/lib/cloudinary";

function isAuthed(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  return session === process.env.ADMIN_SESSION_SECRET;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  await connectDB();
  await GalleryPhoto.findByIdAndUpdate(id, body, { returnDocument: "after" });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();
  const photo = await GalleryPhoto.findById(id);

  if (photo?.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(photo.imagePublicId);
    } catch (e) {
      console.error("Cloudinary delete failed:", e);
    }
  }

  await GalleryPhoto.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
