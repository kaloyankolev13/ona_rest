import type { Metadata } from "next";
import { Playfair_Display, PT_Sans } from "next/font/google";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SynhronaContent from "./SynhronaContent";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  variable: "--syn-serif",
  display: "swap",
});

const ptSans = PT_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--syn-sans",
  display: "swap",
});

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SynhronaPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://ona.rest/${locale}/synhrona`,
      languages: { bg: "/bg/synhrona", en: "/en/synhrona" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://ona.rest/${locale}/synhrona`,
      siteName: "ONA",
      locale,
      type: "website",
    },
  };
}

export default async function SynhronaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className={`${playfair.variable} ${ptSans.variable}`}>
      <SynhronaContent />
    </div>
  );
}
