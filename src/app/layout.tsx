import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { getLocale } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kaloyak = localFont({
  src: "../../public/font/Kaloyak-Regular.ttf",
  variable: "--font-kaloyak",
  display: "swap",
});

const valky = localFont({
  src: "../../public/font/Valky-Regular.ttf",
  variable: "--font-valky",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ONA",
  description: "ONA Restaurant",
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kaloyak.variable} ${valky.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
