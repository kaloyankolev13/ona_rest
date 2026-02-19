"use client";

import {
  Loading,
  MainContent,
  ScrollMarquee,
  HeritageSection,
  CoursesSection,
  TableSection,
  NewsSection,
  SmoothScroll,

} from "@/components";

export default function Home() {
  return (
    <SmoothScroll>
      <Loading duration={1000} />
      <MainContent />
      <ScrollMarquee />
      <HeritageSection />
      <CoursesSection />
      <TableSection />
      <ScrollMarquee />
      <NewsSection />
    </SmoothScroll>
  );
}
