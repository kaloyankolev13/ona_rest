import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import VoucherContent from "./VoucherContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "VoucherPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://ona.rest/${locale}/voucher`,
      languages: { bg: "/bg/voucher", en: "/en/voucher" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://ona.rest/${locale}/voucher`,
      siteName: "ONA",
      locale,
      type: "website",
    },
  };
}

export default async function VoucherPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <VoucherContent />;
}
