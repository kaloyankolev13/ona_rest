import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import cloudinary from "@/lib/cloudinary";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await connectDB();

  const article = await News.findById(id).lean();
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = request.cookies.get("admin_session")?.value;
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const body = await request.json();
  const article = await News.findByIdAndUpdate(id, body, { new: true }).lean();

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = request.cookies.get("admin_session")?.value;
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const article = await News.findById(id);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (article.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(article.imagePublicId);
    } catch {
      // Image may already be deleted from Cloudinary
    }
  }

  await News.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
