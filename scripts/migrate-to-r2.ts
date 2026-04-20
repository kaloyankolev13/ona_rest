/**
 * Safe, resumable migration: Cloudinary -> Cloudflare R2.
 *
 * Strategy: the original `galleryphotos` and `news` collections are left
 * COMPLETELY untouched. For each record containing a Cloudinary URL, the
 * script downloads the image, uploads it to R2, and INSERTS a copy of the
 * record into the new `galleryphotosr2` / `newsr2` collection with the R2
 * URL. The original record's `_id` is preserved in `sourceId` so we can
 * detect duplicates on re-runs.
 *
 * Safety features:
 *  - Original collections are read-only; never modified.
 *  - Already-migrated source records (detected via sourceId) are skipped.
 *  - Upload to R2 happens first; DB insert only on success.
 *  - --dry-run reports without any writes.
 *  - --rollback clears the R2 collections (deletes every doc in them).
 *  - --backup writes a JSON dump of all four collections.
 *
 * Usage:
 *   npm run migrate:r2:backup   # snapshot all collections
 *   npm run migrate:r2:dry      # preview migration
 *   npm run migrate:r2          # run migration (resumable, idempotent)
 *   npm run migrate:r2:rollback # empty the R2 collections
 */
import "dotenv/config";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const DRY_RUN = process.argv.includes("--dry-run");
const ROLLBACK = process.argv.includes("--rollback");
const BACKUP = process.argv.includes("--backup");

const MONGODB_URI = process.env.MONGODB_URI;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Aborting.");
  process.exit(1);
}
if (
  !BACKUP &&
  !ROLLBACK &&
  (!R2_ENDPOINT ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET ||
    !R2_PUBLIC_URL)
) {
  console.error("Missing required R2 env variables. Aborting.");
  process.exit(1);
}

const r2 =
  !BACKUP && !ROLLBACK
    ? new S3Client({
        region: "auto",
        endpoint: R2_ENDPOINT,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID!,
          secretAccessKey: R2_SECRET_ACCESS_KEY!,
        },
      })
    : null;

const GalleryPhotoSchema = new mongoose.Schema(
  {
    image: String,
    imagePublicId: String,
    order: Number,
  },
  { timestamps: true, collection: "galleryphotos", strict: false }
);

const GalleryPhotoR2Schema = new mongoose.Schema(
  {
    image: String,
    imagePublicId: String,
    order: Number,
    sourceId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true, collection: "galleryphotosr2", strict: false }
);

const NewsSchema = new mongoose.Schema(
  {
    title: { bg: String, en: String },
    excerpt: { bg: String, en: String },
    content: { bg: String, en: String },
    image: String,
    imagePublicId: String,
    published: Boolean,
  },
  { timestamps: true, collection: "news", strict: false }
);

const NewsR2Schema = new mongoose.Schema(
  {
    title: { bg: String, en: String },
    excerpt: { bg: String, en: String },
    content: { bg: String, en: String },
    image: String,
    imagePublicId: String,
    published: Boolean,
    sourceId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true, collection: "newsr2", strict: false }
);

const GalleryPhoto = mongoose.model("GalleryPhoto", GalleryPhotoSchema);
const GalleryPhotoR2 = mongoose.model("GalleryPhotoR2", GalleryPhotoR2Schema);
const News = mongoose.model("News", NewsSchema);
const NewsR2 = mongoose.model("NewsR2", NewsR2Schema);

function guessExt(url: string, contentType: string | null): string {
  const fromUrl = url.split("?")[0].split(".").pop();
  if (fromUrl && fromUrl.length <= 5) return fromUrl.toLowerCase();
  if (contentType?.includes("jpeg")) return "jpg";
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  return "jpg";
}

async function uploadToR2(
  sourceUrl: string,
  folder: string
): Promise<{ url: string; key: string }> {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Failed to fetch ${sourceUrl}: ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = guessExt(sourceUrl, contentType);
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

  if (!DRY_RUN) {
    await r2!.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
  }

  return { url: `${R2_PUBLIC_URL}/${key}`, key };
}

function isCloudinary(url: string | undefined | null): boolean {
  return !!url && url.includes("res.cloudinary.com");
}

async function runBackup() {
  console.log("=== BACKUP MODE ===");
  await mongoose.connect(MONGODB_URI!);

  const [photos, photosR2, articles, articlesR2] = await Promise.all([
    GalleryPhoto.find().lean(),
    GalleryPhotoR2.find().lean(),
    News.find().lean(),
    NewsR2.find().lean(),
  ]);

  const snapshot = {
    timestamp: new Date().toISOString(),
    galleryphotos: photos,
    galleryphotosr2: photosR2,
    news: articles,
    newsr2: articlesR2,
  };

  const scriptsDir = path.resolve(process.cwd(), "scripts");
  const outFile = path.join(scriptsDir, `backup-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote backup: ${outFile}`);
  console.log(
    `  galleryphotos: ${photos.length}, galleryphotosr2: ${photosR2.length}`
  );
  console.log(`  news: ${articles.length}, newsr2: ${articlesR2.length}`);
  await mongoose.disconnect();
}

async function runMigration() {
  console.log(DRY_RUN ? "=== DRY RUN (no writes) ===" : "=== LIVE MIGRATION ===");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB");

  let migrated = 0;
  let skippedExists = 0;
  let skippedNotCloudinary = 0;
  let failed = 0;

  const photos = await GalleryPhoto.find().lean();
  console.log(`\nGallery photos in source (galleryphotos): ${photos.length}`);
  if (photos.length > 0) {
    console.log(`  First record sample: _id=${photos[0]._id}, image=${photos[0].image?.substring(0, 80)}...`);
  }
  for (const photo of photos) {
    if (!isCloudinary(photo.image)) {
      console.log(`  ⊘ ${photo._id} skipped (not cloudinary): ${photo.image?.substring(0, 60)}`);
      skippedNotCloudinary++;
      continue;
    }
    const already = await GalleryPhotoR2.findOne({ sourceId: photo._id }).lean();
    if (already) {
      skippedExists++;
      continue;
    }
    try {
      const { url, key } = await uploadToR2(photo.image!, "ona_gallery");
      if (!DRY_RUN) {
        await GalleryPhotoR2.create({
          image: url,
          imagePublicId: key,
          order: photo.order ?? 0,
          sourceId: photo._id,
        });
      }
      console.log(`  ✓ ${photo._id} -> ${key}`);
      migrated++;
    } catch (e) {
      console.error(`  ✗ ${photo._id}:`, (e as Error).message);
      failed++;
    }
  }

  const articles = await News.find().lean();
  console.log(`\nNews articles in source (news): ${articles.length}`);
  if (articles.length > 0) {
    console.log(`  First record sample: _id=${articles[0]._id}, image=${articles[0].image?.substring(0, 80)}...`);
  }
  for (const article of articles) {
    if (!isCloudinary(article.image)) {
      console.log(`  ⊘ ${article._id} skipped (not cloudinary): ${article.image?.substring(0, 60)}`);
      skippedNotCloudinary++;
      continue;
    }
    const already = await NewsR2.findOne({ sourceId: article._id }).lean();
    if (already) {
      skippedExists++;
      continue;
    }
    try {
      const { url, key } = await uploadToR2(article.image!, "ona_news");
      if (!DRY_RUN) {
        await NewsR2.create({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          image: url,
          imagePublicId: key,
          published: article.published ?? false,
          sourceId: article._id,
        });
      }
      console.log(`  ✓ ${article._id} -> ${key}`);
      migrated++;
    } catch (e) {
      console.error(`  ✗ ${article._id}:`, (e as Error).message);
      failed++;
    }
  }

  console.log(
    `\nDone. Migrated: ${migrated}, Skipped (already migrated): ${skippedExists}, Skipped (not Cloudinary): ${skippedNotCloudinary}, Failed: ${failed}`
  );
  await mongoose.disconnect();
}

async function runRollback() {
  console.log("=== ROLLBACK MODE ===");
  console.log(
    "This will DELETE every document in galleryphotosr2 and newsr2. The original galleryphotos / news collections are not touched."
  );
  await mongoose.connect(MONGODB_URI!);

  const [photoResult, newsResult] = await Promise.all([
    GalleryPhotoR2.deleteMany({}),
    NewsR2.deleteMany({}),
  ]);

  console.log(`Deleted ${photoResult.deletedCount} gallery R2 records.`);
  console.log(`Deleted ${newsResult.deletedCount} news R2 records.`);
  console.log(
    "Note: objects uploaded to R2 storage are NOT deleted. Clean them up via the Cloudflare dashboard if needed."
  );
  await mongoose.disconnect();
}

async function main() {
  if (BACKUP) return runBackup();
  if (ROLLBACK) return runRollback();
  return runMigration();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
