import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { getLocale } from "next-intl/server";
import { CustomCursor } from "@/components";
import { Analytics } from "@/components/Analytics/Analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const valky = localFont({
  src: "../../public/font/CoFo-Raffine-61241.ttf",
  variable: "--font-valky",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ona.rest"),
  title: { default: "ONA", template: "%s | ONA" },
  description: "ONA Restaurant — Стакевци",
  icons: { icon: "/logo.svg" },
  openGraph: {
    siteName: "ONA",
    type: "website",
    locale: "bg_BG",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent','default',{analytics_storage:'denied'});
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${valky.variable} antialiased`}
      >
        {children}
        <CustomCursor />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
