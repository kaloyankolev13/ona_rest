import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import NewsR2 from "@/models/NewsR2";
import { r2, R2_BUCKET } from "@/lib/r2";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await connectDB();

  const r2Article = await NewsR2.findById(id).lean();
  if (r2Article) return NextResponse.json(r2Article);

  const legacyArticle = await News.findById(id).lean();
  if (legacyArticle) return NextResponse.json(legacyArticle);

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = request.cookies.get("admin_session")?.value;
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const body = await request.json();

  const r2Updated = await NewsR2.findByIdAndUpdate(id, body, { new: true }).lean();
  if (r2Updated) return NextResponse.json(r2Updated);

  const legacyUpdated = await News.findByIdAndUpdate(id, body, { new: true }).lean();
  if (legacyUpdated) return NextResponse.json(legacyUpdated);

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = request.cookies.get("admin_session")?.value;
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const r2Article = await NewsR2.findById(id);
  if (r2Article) {
    if (r2Article.imagePublicId) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: r2Article.imagePublicId,
          })
        );
      } catch {
        // Image may already be deleted from R2
      }
    }
    await NewsR2.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  }

  const legacyArticle = await News.findById(id);
  if (legacyArticle) {
    await News.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
