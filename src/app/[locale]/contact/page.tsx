import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function ContactPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Pages");

  return (
    <main style={{ minHeight: "100vh", padding: "4rem 2rem" }}>
      <h1>{t("contact")}</h1>
    </main>
  );
}
