import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";

export async function GET(request: NextRequest) {
  await connectDB();

  const { searchParams } = request.nextUrl;
  const publishedOnly = searchParams.get("published") === "true";

  const filter = publishedOnly ? { published: true } : {};
  const news = await News.find(filter).sort({ createdAt: -1 }).lean();

  return NextResponse.json(news);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();

  const article = await News.create({
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    image: body.image || "",
    imagePublicId: body.imagePublicId || "",
    published: body.published ?? false,
  });

  return NextResponse.json(article, { status: 201 });
}
