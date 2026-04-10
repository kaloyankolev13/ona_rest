import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HomeContent from "./HomeContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://ona.rest/${locale}`,
      languages: { bg: "/bg", en: "/en" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://ona.rest/${locale}`,
      siteName: "ONA",
      locale,
      type: "website",
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "ONA",
  url: "https://ona.rest",
  telephone: "+359 88 7439999",
  email: "booking@ona.rest",
  servesCuisine: "Bulgarian",
  priceRange: "$$$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. 31 №1",
    addressLocality: "Стакевци",
    addressCountry: "BG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.5461,
    longitude: 22.5669,
  },
  image: "https://ona.rest/logo.svg",
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent />
    </>
  );
}
