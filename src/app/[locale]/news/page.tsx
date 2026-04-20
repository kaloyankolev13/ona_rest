import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import NewsR2 from "@/models/NewsR2";
import NewsContent from "./NewsContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NewsPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://ona.rest/${locale}/news`,
      languages: { bg: "/bg/news", en: "/en/news" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://ona.rest/${locale}/news`,
      siteName: "ONA",
      locale,
      type: "website",
    },
  };
}

async function getPublishedNews() {
  await connectDB();

  const [legacy, current] = await Promise.all([
    News.find({ published: true }).sort({ createdAt: -1 }).lean(),
    NewsR2.find({ published: true }).sort({ createdAt: -1 }).lean(),
  ]);

  const migratedSourceIds = new Set(
    current.map((a) => a.sourceId?.toString()).filter(Boolean) as string[]
  );
  const unmigratedLegacy = legacy.filter(
    (a) => !migratedSourceIds.has(String(a._id))
  );

  const merged = [...unmigratedLegacy, ...current].sort(
    (a, b) =>
      (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()
  );

  return merged.map((a) => ({
    _id: String(a._id),
    title: { bg: a.title.bg, en: a.title.en },
    excerpt: { bg: a.excerpt.bg, en: a.excerpt.en },
    image: a.image,
    createdAt: (a.createdAt as Date).toISOString(),
  }));
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const articles = await getPublishedNews();

  return <NewsContent articles={articles} locale={locale} />;
}
