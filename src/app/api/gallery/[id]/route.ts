import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectDB } from "@/lib/mongodb";
import GalleryPhoto from "@/models/GalleryPhoto";
import GalleryPhotoR2 from "@/models/GalleryPhotoR2";
import { r2, R2_BUCKET } from "@/lib/r2";

function isAuthed(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  return session === process.env.ADMIN_SESSION_SECRET;
}

async function findInEither(id: string) {
  const r2Doc = await GalleryPhotoR2.findById(id);
  if (r2Doc) return { doc: r2Doc, source: "r2" as const };
  const legacyDoc = await GalleryPhoto.findById(id);
  if (legacyDoc) return { doc: legacyDoc, source: "legacy" as const };
  return null;
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

  const updatedR2 = await GalleryPhotoR2.findByIdAndUpdate(id, body, {
    returnDocument: "after",
  });
  if (updatedR2) {
    return NextResponse.json({ success: true });
  }

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
  const found = await findInEither(id);

  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (found.source === "r2" && found.doc.imagePublicId) {
    try {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: found.doc.imagePublicId,
        })
      );
    } catch (e) {
      console.error("R2 delete failed:", e);
    }
    await GalleryPhotoR2.findByIdAndDelete(id);
  } else {
    await GalleryPhoto.findByIdAndDelete(id);
  }

  return NextResponse.json({ success: true });
}
