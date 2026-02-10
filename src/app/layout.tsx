import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SideBar } from "@/components";

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
  description: "ONA Rest",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kaloyak.variable} ${valky.variable} antialiased`}
      >
        {children}
        <SideBar />
      </body>
    </html>
  );
}
