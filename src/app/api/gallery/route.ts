import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import GalleryPhoto from "@/models/GalleryPhoto";

function isAuthed(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  return session === process.env.ADMIN_SESSION_SECRET;
}

export async function GET() {
  await connectDB();
  const photos = await GalleryPhoto.find().sort({ order: 1, createdAt: -1 }).lean();

  return NextResponse.json(
    photos.map((p) => ({
      _id: String(p._id),
      image: p.image,
      imagePublicId: p.imagePublicId,
      order: p.order,
      createdAt: p.createdAt.toISOString(),
    }))
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { image, imagePublicId } = await request.json();

  if (!image || !imagePublicId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();
  const count = await GalleryPhoto.countDocuments();
  const photo = await GalleryPhoto.create({ image, imagePublicId, order: count });

  return NextResponse.json({
    _id: String(photo._id),
    image: photo.image,
    imagePublicId: photo.imagePublicId,
    order: photo.order,
  });
}
