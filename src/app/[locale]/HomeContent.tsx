"use client";

import {
  Loading,
  MainContent,
  ScrollMarquee,
  StorySection,
  CoursesSection,
  TableSection,
  NewsSection,
  JreSection,
  SmoothScroll,
} from "@/components";

export default function HomeContent() {
  return (
    <SmoothScroll>
      <Loading duration={1000} />
      <MainContent />
      <ScrollMarquee />
      <StorySection />
      <CoursesSection />
      <TableSection />
      <ScrollMarquee />
      <NewsSection />
      <JreSection />
    </SmoothScroll>
  );
}
