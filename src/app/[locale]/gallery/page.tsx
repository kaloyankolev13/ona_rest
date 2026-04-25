import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connectDB } from "@/lib/mongodb";
import GalleryPhoto from "@/models/GalleryPhoto";
import GalleryPhotoR2 from "@/models/GalleryPhotoR2";
import GalleryContent from "./GalleryContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GalleryPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://ona.rest/${locale}/gallery`,
      languages: { bg: "/bg/gallery", en: "/en/gallery" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://ona.rest/${locale}/gallery`,
      siteName: "ONA",
      locale,
      type: "website",
    },
  };
}

async function getPhotos() {
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

  const merged = [...unmigratedLegacy, ...current].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime();
  });

  return merged.map((p) => ({
    _id: String(p._id),
    image: p.image,
  }));
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const photos = await getPhotos();
  return <GalleryContent photos={photos} />;
}
