"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image, { StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animateLettersOnScroll,
  animateRevealOnScroll,
} from "@/animations/scrollAnimations";
import animStyles from "@/animations/animations.module.css";
import { SmoothScroll } from "@/components";
import { ShevitsaDecor } from "@/components/ShevitsaDecor/ShevitsaDecor";
import styles from "./About.module.css";

import filipImg from "@/assets/team/filip.jpg";
import filipImg2 from "@/assets/team/filip2.jpeg";
import filipImg3 from "@/assets/team/filip3.jpeg";
import filipImg4 from "@/assets/team/filip4.jpg";
import plamImg from "@/assets/team/plam.jpg";
import plamImg2 from "@/assets/team/plam2.jpg";
import plamImg3 from "@/assets/team/plam3.jpg";
import hrisoImg from "@/assets/team/hriso.jpg";
import hrisoImg2 from "@/assets/team/hriso2.jpg";
import hrisoImg3 from "@/assets/team/hriso3.jpg";

gsap.registerPlugin(ScrollTrigger);

interface TeamMember {
  photos: StaticImageData[];
  nameKey: string;
  roleKey: string;
  bioKey: string;
  interval: number;
}

const TEAM: TeamMember[] = [
  { photos: [filipImg, filipImg2, filipImg3, filipImg4], nameKey: "filipName", roleKey: "filipRole", bioKey: "filipBio", interval: 3000 },
  { photos: [plamImg, plamImg2, plamImg3], nameKey: "plamName", roleKey: "plamRole", bioKey: "plamBio", interval: 4200 },
  { photos: [hrisoImg, hrisoImg2, hrisoImg3], nameKey: "hrisoName", roleKey: "hrisoRole", bioKey: "hrisoBio", interval: 3600 },
];

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStart = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart.current === null) return;
      const delta = e.changedTouches[0].clientX - touchStart.current;
      touchStart.current = null;
      if (Math.abs(delta) < 40) return;
      if (delta < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}

function TeamCard({
  member,
  onClick,
}: {
  member: TeamMember & { name: string; role: string };
  onClick: () => void;
}) {
  const [active, setActive] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goNext = useCallback(
    () => setActive((prev) => (prev + 1) % member.photos.length),
    [member.photos.length]
  );
  const goPrev = useCallback(
    () => setActive((prev) => (prev - 1 + member.photos.length) % member.photos.length),
    [member.photos.length]
  );

  const swipe = useSwipe(goNext, goPrev);

  useEffect(() => {
    if (member.photos.length <= 1) return;
    autoRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % member.photos.length);
    }, member.interval);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [member.photos.length, member.interval]);

  return (
    <div
      className={styles.teamCard}
      onClick={onClick}
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
      data-clickable
    >
      <div className={styles.teamCardImages}>
        {member.photos.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={member.name}
            fill
            className={`${styles.teamCardImg} ${i === active ? styles.teamCardImgActive : ""}`}
          />
        ))}
      </div>
      <div className={styles.teamCardOverlay}>
        <span className={styles.teamCardName}>{member.name}</span>
        <span className={styles.teamCardRole}>{member.role}</span>
      </div>
      {member.photos.length > 1 && (
        <div className={styles.teamCardDots}>
          {member.photos.map((_, i) => (
            <span
              key={i}
              className={`${styles.teamCardDot} ${i === active ? styles.teamCardDotActive : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function splitToLetters(text: string, className: string) {
  return text.split(" ").map((word, wi) => (
    <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
      {word.split("").map((char, ci) => (
        <span key={ci} className={className}>{char}</span>
      ))}
      {wi < text.split(" ").length - 1 && (
        <span className={className}>{"\u00A0"}</span>
      )}
    </span>
  ));
}

export default function AboutPage() {
  const t = useTranslations("AboutPage");
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const philRef = useRef<HTMLDivElement>(null);
  const philHeadingRef = useRef<HTMLHeadingElement>(null);
  const philTextRef = useRef<HTMLParagraphElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const teamHeadingRef = useRef<HTMLHeadingElement>(null);
  const teamTextRef = useRef<HTMLDivElement>(null);

  const modalTouchStart = useRef<number | null>(null);

  const openModal = useCallback((idx: number) => {
    setModalIdx(idx);
    setModalPhotoIdx(0);
  }, []);

  const closeModal = useCallback(() => {
    setModalIdx(null);
  }, []);

  useEffect(() => {
    if (modalIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [modalIdx, closeModal]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 }
        );
      }

      if (philHeadingRef.current) {
        animateLettersOnScroll(
          philHeadingRef.current,
          `.${animStyles.letter}`,
          { stagger: 0.02, duration: 0.35 }
        );
      }

      if (philTextRef.current) {
        animateRevealOnScroll(philTextRef.current, {
          y: 30,
          duration: 0.6,
          delay: 0.6,
        });
      }

      if (valuesRef.current) {
        const cards = valuesRef.current.querySelectorAll(`.${styles.valueCard}`);
        if (cards.length) {
          animateRevealOnScroll(cards, {
            y: 60,
            duration: 0.7,
            stagger: 0.15,
          });
        }
      }

      if (teamHeadingRef.current) {
        animateLettersOnScroll(
          teamHeadingRef.current,
          `.${animStyles.letter}`,
          { stagger: 0.02, duration: 0.35 }
        );
      }

      if (teamTextRef.current) {
        animateRevealOnScroll(teamTextRef.current, {
          y: 40,
          duration: 0.7,
          delay: 0.3,
        });
      }

      if (teamRef.current) {
        const cards = teamRef.current.querySelectorAll(`.${styles.teamCard}`);
        if (cards.length) {
          animateRevealOnScroll(cards, {
            y: 60,
            duration: 0.8,
            stagger: 0.2,
          });
        }
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      {/* Hero */}
      <section ref={heroRef} className={styles.hero}>
        <ShevitsaDecor variant={4} />
        <span className={styles.heroSubtitle}>{t("heroSubtitle")}</span>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>
          {t("heroTitle")}
        </h1>
      </section>

      {/* Philosophy */}
      <section ref={philRef} className={styles.philosophy}>
        <div className={styles.philosophyInner}>
          <span className={styles.tag}>{t("philosophyTag")}</span>
          <h2 ref={philHeadingRef} className={styles.philosophyHeading}>
            {splitToLetters(t("philosophyHeading"), animStyles.letter)}
          </h2>
          <p ref={philTextRef} className={styles.philosophyText}>
            {t("philosophyText")}
          </p>
        </div>
      </section>

      {/* Values
      <section className={styles.values}>
        <ShevitsaDecor variant={5} />
        <div className={styles.valuesInner}>
          <span className={`${styles.tag} ${styles.tagDark}`}>
            {t("valuesTag")}
          </span>
          <div ref={valuesRef} className={styles.valuesGrid}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.valueCard}>
                <div className={styles.valueIcon} />
                <h3 className={styles.valueTitle}>
                  {t(`value${n}Title` as "value1Title")}
                </h3>
                <p className={styles.valueText}>
                  {t(`value${n}Text` as "value1Text")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Team */}
      <section ref={teamRef} className={styles.team}>
        <div className={styles.teamInner}>
          <div ref={teamTextRef} className={styles.teamText}>
            <span className={styles.tag}>{t("teamTag")}</span>
            <h2 ref={teamHeadingRef} className={styles.teamHeading}>
              {splitToLetters(t("teamHeading"), animStyles.letter)}
            </h2>
            <p className={styles.teamParagraph}>{t("teamText")}</p>
          </div>
          <div className={styles.teamCards}>
            {TEAM.map((m, i) => (
              <TeamCard
                key={m.nameKey}
                member={{ ...m, name: t(m.nameKey as "filipName"), role: t(m.roleKey as "filipRole") }}
                onClick={() => openModal(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Team Modal */}
      {modalIdx !== null && (
        <div className={styles.modalBackdrop} onClick={closeModal} data-lenis-prevent>
          <div
            ref={modalRef}
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={closeModal}>
              &times;
            </button>
            <div className={styles.modalBody}>
              <div
                className={styles.modalPhoto}
                onTouchStart={(e) => { modalTouchStart.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (modalTouchStart.current === null) return;
                  const delta = e.changedTouches[0].clientX - modalTouchStart.current;
                  modalTouchStart.current = null;
                  if (Math.abs(delta) < 40) return;
                  const len = TEAM[modalIdx].photos.length;
                  if (delta < 0) setModalPhotoIdx((prev) => (prev + 1) % len);
                  else setModalPhotoIdx((prev) => (prev - 1 + len) % len);
                }}
              >
                {TEAM[modalIdx].photos.map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt={t(TEAM[modalIdx].nameKey as "filipName")}
                    fill
                    className={`${styles.modalPhotoImg} ${i === modalPhotoIdx ? styles.modalPhotoImgActive : ""}`}
                  />
                ))}
                {TEAM[modalIdx].photos.length > 1 && (
                  <div className={styles.modalDots}>
                    {TEAM[modalIdx].photos.map((_, i) => (
                      <button
                        key={i}
                        className={`${styles.modalDot} ${i === modalPhotoIdx ? styles.modalDotActive : ""}`}
                        onClick={() => setModalPhotoIdx(i)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.modalInfo}>
                <h3 className={styles.modalName}>
                  {t(TEAM[modalIdx].nameKey as "filipName")}
                </h3>
                <span className={styles.modalRole}>
                  {t(TEAM[modalIdx].roleKey as "filipRole")}
                </span>
                <div className={styles.modalBio}>
                  {t(TEAM[modalIdx].bioKey as "filipBio")
                    .split("\n\n")
                    .map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SmoothScroll>
  );
}
