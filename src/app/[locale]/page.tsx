"use client";

import {
  Loading,
  MainContent,
  ScrollMarquee,
  HeritageSection,
} from "@/components";

export default function Home() {
  return (
    <>
      <Loading duration={1000} />
      <MainContent />
      <ScrollMarquee />
      <HeritageSection />
    </>
  );
}
