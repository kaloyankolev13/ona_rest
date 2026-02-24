import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import ArticleContent from "./ArticleContent";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export const dynamic = "force-dynamic";

async function getArticle(id: string) {
  await connectDB();

  try {
    const article = await News.findById(id).lean();
    if (!article || !article.published) return null;

    return {
      _id: String(article._id),
      title: { bg: article.title.bg, en: article.title.en },
      excerpt: { bg: article.excerpt.bg, en: article.excerpt.en },
      content: { bg: article.content.bg, en: article.content.en },
      image: article.image,
      createdAt: article.createdAt.toISOString(),
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
