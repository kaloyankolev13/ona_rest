import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import NewsR2 from "@/models/NewsR2";

export async function GET(request: NextRequest) {
  await connectDB();

  const { searchParams } = request.nextUrl;
  const publishedOnly = searchParams.get("published") === "true";

  const filter = publishedOnly ? { published: true } : {};

  const [legacy, current] = await Promise.all([
    News.find(filter).sort({ createdAt: -1 }).lean(),
    NewsR2.find(filter).sort({ createdAt: -1 }).lean(),
  ]);

  const migratedSourceIds = new Set(
    current.map((a) => a.sourceId?.toString()).filter(Boolean) as string[]
  );
  const unmigratedLegacy = legacy.filter(
    (a) => !migratedSourceIds.has(String(a._id))
  );

  const merged = [...unmigratedLegacy, ...current].sort((a, b) => {
    return (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime();
  });

  return NextResponse.json(merged);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();

  const article = await NewsR2.create({
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    image: body.image || "",
    imagePublicId: body.imagePublicId || "",
    published: body.published ?? false,
  });

  return NextResponse.json(article, { status: 201 });
}
