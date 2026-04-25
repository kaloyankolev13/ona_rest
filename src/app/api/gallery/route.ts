import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import GalleryPhoto from "@/models/GalleryPhoto";
import GalleryPhotoR2 from "@/models/GalleryPhotoR2";

function isAuthed(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  return session === process.env.ADMIN_SESSION_SECRET;
}

export async function GET() {
  await connectDB();
  const [legacy, current] = await Promise.all([
    GalleryPhoto.find().sort({ order: 1, createdAt: -1 }).lean(),
    GalleryPhotoR2.find().sort({ order: 1, createdAt: -1 }).lean(),
  ]);

  const migratedSourceIds = new Set(
    current.map((p) => p.sourceId?.toString()).filter(Boolean) as string[]
  );
  const unmigratedLegacy = legacy.filter(
    (p) => !migratedSourceIds.has(String(p._id))
  );

  const merged = [...unmigratedLegacy, ...current]
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime();
    })
    .map((p) => ({
      _id: String(p._id),
      image: p.image,
      imagePublicId: p.imagePublicId,
      order: p.order,
      createdAt: (p.createdAt as Date).toISOString(),
    }));

  return NextResponse.json(merged);
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
  const [legacyCount, r2Count] = await Promise.all([
    GalleryPhoto.countDocuments(),
    GalleryPhotoR2.countDocuments(),
  ]);
  const photo = await GalleryPhotoR2.create({
    image,
    imagePublicId,
    order: legacyCount + r2Count,
  });

  return NextResponse.json({
    _id: String(photo._id),
    image: photo.image,
    imagePublicId: photo.imagePublicId,
    order: photo.order,
  });
}
