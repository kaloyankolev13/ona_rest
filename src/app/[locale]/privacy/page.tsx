import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SmoothScroll } from "@/components";
import { ShevitsaDecor } from "@/components/ShevitsaDecor/ShevitsaDecor";
import styles from "./Privacy.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrivacyPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `https://ona.rest/${locale}/privacy`,
      languages: { bg: "/bg/privacy", en: "/en/privacy" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://ona.rest/${locale}/privacy`,
      siteName: "ONA",
      locale,
      type: "website",
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("PrivacyPage");

  return (
    <SmoothScroll>
      <header className={styles.hero}>
        <ShevitsaDecor variant={6} />
        <p className={styles.heroSubtitle}>{t("heroSubtitle")}</p>
        <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
      </header>

      <article className={styles.wrap}>
        <ShevitsaDecor variant={9} />
        <div className={styles.inner}>
          <p className={styles.effective}>{t("effectiveDate")}</p>

          <section className={styles.section} aria-labelledby="privacy-s1">
            <h2 id="privacy-s1" className={styles.sectionTitle}>
              {t("s1Title")}
            </h2>
            <p>{t("s1p1")}</p>
            <p>{t("s1p2")}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s2">
            <h2 id="privacy-s2" className={styles.sectionTitle}>
              {t("s2Title")}
            </h2>
            <p>{t("s2p1")}</p>
            <p>{t("s2controller")}</p>
            <p className={styles.contactBlock}>
              {t("s2emailLabel")}{" "}
              <a className={styles.emailLink} href="mailto:info@ona.rest">
                info@ona.rest
              </a>
            </p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s3">
            <h2 id="privacy-s3" className={styles.sectionTitle}>
              {t("s3Title")}
            </h2>
            <p>{t("s3intro")}</p>
            <ul className={styles.list}>
              <li>{t("s3personal")}</li>
              <li>{t("s3usage")}</li>
              <li>{t("s3cookies")}</li>
              <li>{t("s3analytics")}</li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s4">
            <h2 id="privacy-s4" className={styles.sectionTitle}>
              {t("s4Title")}
            </h2>
            <p>{t("s4intro")}</p>
            <ul className={styles.list}>
              <li>{t("s4contractual")}</li>
              <li>{t("s4legitimate")}</li>
              <li>{t("s4consent")}</li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s5">
            <h2 id="privacy-s5" className={styles.sectionTitle}>
              {t("s5Title")}
            </h2>
            <p>{t("s5intro")}</p>
            <ul className={styles.list}>
              <li>{t("s5i1")}</li>
              <li>{t("s5i2")}</li>
              <li>{t("s5i3")}</li>
              <li>{t("s5i4")}</li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s6">
            <h2 id="privacy-s6" className={styles.sectionTitle}>
              {t("s6Title")}
            </h2>
            <p>{t("s6p1")}</p>
            <ul className={styles.list}>
              <li>{t("s6li1")}</li>
              <li>{t("s6li2")}</li>
            </ul>
            <p>{t("s6p3")}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s7">
            <h2 id="privacy-s7" className={styles.sectionTitle}>
              {t("s7Title")}
            </h2>
            <p>{t("s7p1")}</p>
            <p>{t("s7p2")}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s8">
            <h2 id="privacy-s8" className={styles.sectionTitle}>
              {t("s8Title")}
            </h2>
            <p>{t("s8intro")}</p>
            <ul className={styles.list}>
              <li>{t("s8li1")}</li>
              <li>{t("s8li2")}</li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s9">
            <h2 id="privacy-s9" className={styles.sectionTitle}>
              {t("s9Title")}
            </h2>
            <p>{t("s9intro")}</p>
            <ul className={styles.list}>
              <li>{t("s9i1")}</li>
              <li>{t("s9i2")}</li>
              <li>{t("s9i3")}</li>
              <li>{t("s9i4")}</li>
              <li>{t("s9i5")}</li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s10">
            <h2 id="privacy-s10" className={styles.sectionTitle}>
              {t("s10Title")}
            </h2>
            <p>{t("s10p1")}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s11">
            <h2 id="privacy-s11" className={styles.sectionTitle}>
              {t("s11Title")}
            </h2>
            <p>{t("s11p1")}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s12">
            <h2 id="privacy-s12" className={styles.sectionTitle}>
              {t("s12Title")}
            </h2>
            <p>{t("s12p1")}</p>
          </section>

          <section className={styles.section} aria-labelledby="privacy-s13">
            <h2 id="privacy-s13" className={styles.sectionTitle}>
              {t("s13Title")}
            </h2>
            <p>{t("s13p1")}</p>
            <p className={styles.contactBlock}>
              {t("s13emailLabel")}{" "}
              <a className={styles.emailLink} href="mailto:booking@ona.rest">
                booking@ona.rest
              </a>
            </p>
          </section>
        </div>
      </article>
    </SmoothScroll>
  );
}
