import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import NewsR2 from "@/models/NewsR2";
import ArticleContent from "./ArticleContent";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export const dynamic = "force-dynamic";

async function getArticle(id: string) {
  await connectDB();

  try {
    const r2Article = await NewsR2.findById(id).lean();
    if (r2Article) {
      if (!r2Article.published) return null;
      return {
        _id: String(r2Article._id),
        title: { bg: r2Article.title.bg, en: r2Article.title.en },
        excerpt: { bg: r2Article.excerpt.bg, en: r2Article.excerpt.en },
        content: { bg: r2Article.content.bg, en: r2Article.content.en },
        image: r2Article.image,
        createdAt: (r2Article.createdAt as Date).toISOString(),
      };
    }

    const migratedVersion = await NewsR2.findOne({ sourceId: id }).lean();
    if (migratedVersion) {
      if (!migratedVersion.published) return null;
      return {
        _id: String(migratedVersion._id),
        title: { bg: migratedVersion.title.bg, en: migratedVersion.title.en },
        excerpt: {
          bg: migratedVersion.excerpt.bg,
          en: migratedVersion.excerpt.en,
        },
        content: {
          bg: migratedVersion.content.bg,
          en: migratedVersion.content.en,
        },
        image: migratedVersion.image,
        createdAt: (migratedVersion.createdAt as Date).toISOString(),
      };
    }

    const legacyArticle = await News.findById(id).lean();
    if (!legacyArticle || !legacyArticle.published) return null;
    return {
      _id: String(legacyArticle._id),
      title: { bg: legacyArticle.title.bg, en: legacyArticle.title.en },
      excerpt: { bg: legacyArticle.excerpt.bg, en: legacyArticle.excerpt.en },
      content: { bg: legacyArticle.content.bg, en: legacyArticle.content.en },
      image: legacyArticle.image,
      createdAt: legacyArticle.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const article = await getArticle(id);
  if (!article) notFound();

  const loc = locale as "bg" | "en";

  const formatted = {
    title: article.title[loc],
    excerpt: article.excerpt[loc],
    content: article.content[loc],
    image: article.image,
    date: new Date(article.createdAt).toLocaleDateString(
      loc === "bg" ? "bg-BG" : "en-GB",
      { day: "2-digit", month: "short", year: "numeric" }
    ),
  };

  return <ArticleContent article={formatted} />;
}
