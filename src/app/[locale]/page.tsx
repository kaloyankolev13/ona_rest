"use client";

import {
  Loading,
  MainContent,
  ScrollMarquee,
  HeritageSection,
  CoursesSection,
  NewsSection,
} from "@/components";

export default function Home() {
  return (
    <>
      <Loading duration={1000} />
      <MainContent />
      <ScrollMarquee />
      <HeritageSection />
      <CoursesSection />
      <ScrollMarquee />
      <NewsSection />
    </>
  );
}
