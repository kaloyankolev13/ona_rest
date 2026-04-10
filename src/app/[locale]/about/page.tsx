import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AboutContent from "./AboutContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://ona.rest/${locale}/about`,
      languages: { bg: "/bg/about", en: "/en/about" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://ona.rest/${locale}/about`,
      siteName: "ONA",
      locale,
      type: "website",
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}
