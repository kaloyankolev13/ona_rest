import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BookContent from "./BookContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BookPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://ona.rest/${locale}/book`,
      languages: { bg: "/bg/book", en: "/en/book" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://ona.rest/${locale}/book`,
      siteName: "ONA",
      locale,
      type: "website",
    },
  };
}

export default async function BookPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BookContent />;
}
