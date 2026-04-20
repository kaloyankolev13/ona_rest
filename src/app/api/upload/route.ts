import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  if (session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "ona_news";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return NextResponse.json({
    url: `${R2_PUBLIC_URL}/${key}`,
    publicId: key,
  });
}
