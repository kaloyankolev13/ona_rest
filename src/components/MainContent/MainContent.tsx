"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import styles from "./MainContent.module.css";

const LOADING_DELAY = 1.8;
const VIDEO_SRC =
  "https://res.cloudinary.com/di43xpxdg/video/upload/v1775041327/ona_rest/intro_htxw7w.mp4";

export function MainContent() {
  const t = useTranslations("MainContent");
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(videoSectionRef.current, { xPercent: -100, opacity: 0 });
      gsap.set(textRef.current, { xPercent: 60, opacity: 0 });

      gsap.to(videoSectionRef.current, {
        xPercent: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: LOADING_DELAY,
      });

      gsap.to(textRef.current, {
        xPercent: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: LOADING_DELAY + 0.15,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div ref={videoSectionRef} className={styles.videoSection}>
          <div className={styles.videoWrapper}>
            <video
              ref={videoRef}
              className={styles.video}
              src={VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
            />
            <button
              className={styles.muteBtn}
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 010 14.14" />
                  <path d="M15.54 8.46a5 5 0 010 7.07" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div ref={textRef} className={styles.textSection}>
          <div className={styles.dictCard}>
            <h1 className={styles.dictWord}>{t("dictTitle")}</h1>
            <p className={styles.dictPhonetic}>{t("dictPhonetic")}</p>
            <hr className={styles.dictDivider} />
            <p className={styles.dictDef}>{t("dictDef1")}</p>
            <p className={styles.dictDef}>{t("dictDef2")}</p>
            <p className={styles.dictFinal}>{t("dictFinal")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
