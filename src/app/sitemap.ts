import type { MetadataRoute } from "next";

const BASE = "https://ona.rest";
const locales = ["bg", "en"];
const routes = ["", "/about", "/book", "/contact", "/gallery", "/news", "/voucher", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${BASE}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : 0.8,
    }))
  );
}
