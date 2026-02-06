"use client";

import { Loading, MainContent } from "@/components";

export default function Home() {
  return (
    <>
      <Loading duration={3000} />
      <MainContent />
    </>
  );
}
