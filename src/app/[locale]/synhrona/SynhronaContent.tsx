"use client";

import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import styles from "./Synhrona.module.css";

const TOTAL = 9;
const BUSY_MS = 820;

export default function SynhronaContent() {
  const t = useTranslations("SynhronaPage");
  const chips = t.raw("chips") as string[];
  const prog = t.raw("prog") as string[];

  const [cur, setCur] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // refs mirror state so global listeners read fresh values without re-binding
  const curRef = useRef(0);
  const busyRef = useRef(false);
  const wheelLockRef = useRef(false);

  const goTo = useCallback((n: number) => {
    const target = Math.max(0, Math.min(TOTAL - 1, n));
    if (target === curRef.current || busyRef.current) return;
    busyRef.current = true;
    curRef.current = target;
    setCur(target);
    setTimeout(() => {
      busyRef.current = false;
    }, BUSY_MS);
  }, []);

  const next = useCallback(() => goTo(curRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(curRef.current - 1), [goTo]);

  // Lock page scroll while the guided experience is mounted.
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // Wheel / keyboard / touch navigation.
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      return !!el && /INPUT|TEXTAREA/.test(el.tagName);
    };

    const onWheel = (e: WheelEvent) => {
      if (isTyping() || busyRef.current || wheelLockRef.current) return;
      if (Math.abs(e.deltaY) < 12) return;
      wheelLockRef.current = true;
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 120);
      if (e.deltaY > 0) next();
      else prev();
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTyping()) return;
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prev();
      }
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY == null || busyRef.current || isTyping()) {
        touchY = null;
        return;
      }
      const dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (dy > 45) next();
      else if (dy < -45) prev();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [next, prev]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Prototype behaviour: intercepted client-side.
    // TODO: wire to a real endpoint/email for production submissions.
    setSubmitted(true);
  };

  const stepClass = (i: number) =>
    `${styles.step}${i === cur ? ` ${styles.active}` : ""}`;

  return (
    <div className={styles.root}>
      <main className={styles.stage}>
        {/* 0 · HERO */}
        <section className={`${stepClass(0)} ${styles.hero}`}>
          <div className={`${styles.stepInner} ${styles.heroInner}`}>
            <div className={`${styles.heroBadge} ${styles.rv}`}>
              {t("heroBadge")}
            </div>
            <h1 className={`${styles.heroTitle} ${styles.rv} ${styles.d1}`}>
              <span>синхр</span>
              <span className={styles.ona}>ONÀ</span>
            </h1>
            <p className={`${styles.heroSub} ${styles.rv} ${styles.d2}`}>
              {t("heroSub")}
            </p>
          </div>
        </section>

        {/* 1 · WHAT */}
        <section className={stepClass(1)}>
          <div className={`${styles.stepInner} ${styles.split}`}>
            <div>
              <div className={`${styles.kicker} ${styles.rv}`}>
                {t("b1Kicker")}
              </div>
              <h2 className={`${styles.h2} ${styles.rv} ${styles.d1}`}>
                {t("b1Title")}
              </h2>
              <p className={`${styles.lead} ${styles.rv} ${styles.d2}`}>
                {t("b1Body")}
              </p>
            </div>
            <div className={`${styles.colMedia} ${styles.rv} ${styles.d1}`}>
              <div className={`${styles.media} ${styles.mediaTall}`}>
                {t("imgIntro")}
              </div>
            </div>
          </div>
        </section>

        {/* 2 · WHO */}
        <section className={stepClass(2)}>
          <div className={`${styles.stepInner} ${styles.split} ${styles.rev}`}>
            <div>
              <div className={`${styles.kicker} ${styles.rv}`}>
                {t("b2Kicker")}
              </div>
              <h2 className={`${styles.h2} ${styles.rv} ${styles.d1}`}>
                {t("b2Title")}
              </h2>
              <p className={`${styles.lead} ${styles.rv} ${styles.d2}`}>
                {t("b2Body")}
              </p>
              <div className={`${styles.tagchips} ${styles.rv} ${styles.d3}`}>
                {chips.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
            </div>
            <div className={`${styles.colMedia} ${styles.rv} ${styles.d1}`}>
              <div className={`${styles.media} ${styles.mediaTall}`}>
                {t("imgWho")}
              </div>
            </div>
          </div>
        </section>

        {/* 3 · PROGRAMME */}
        <section className={stepClass(3)}>
          <div className={styles.stepInner}>
            <div className={`${styles.kicker} ${styles.center} ${styles.rv}`}>
              {t("b3Kicker")}
            </div>
            <h2
              className={`${styles.h2} ${styles.rv} ${styles.d1}`}
              style={{ textAlign: "center", marginBottom: 30 }}
            >
              {t("b3Title")}
            </h2>
            <ol className={`${styles.progGrid} ${styles.rv} ${styles.d2}`}>
              {prog.map((item, i) => (
                <li key={i}>
                  <span className={styles.n}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.t}>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4 · WHERE & WHEN */}
        <section className={stepClass(4)}>
          <div className={`${styles.stepInner} ${styles.when}`}>
            <div className={`${styles.kicker} ${styles.center} ${styles.rv}`}>
              {t("b4Kicker")}
            </div>
            <div className={`${styles.whenBig} ${styles.rv} ${styles.d1}`}>
              {t("b4Date")}
            </div>
            <div className={`${styles.whenPlace} ${styles.rv} ${styles.d2}`}>
              {t("b4Place")}
            </div>
            <p className={`${styles.whenNote} ${styles.rv} ${styles.d3}`}>
              {t("b4Note")}
            </p>
          </div>
        </section>

        {/* 5 · IMAGE BREAK */}
        <section className={stepClass(5)}>
          <div className={styles.stepInner} style={{ maxWidth: 920 }}>
            <div className={`${styles.media} ${styles.mediaWide} ${styles.rv}`}>
              {t("imgBreak")}
            </div>
          </div>
        </section>

        {/* 6 · SELECTION */}
        <section className={stepClass(6)}>
          <div className={`${styles.stepInner} ${styles.split}`}>
            <div>
              <div className={`${styles.kicker} ${styles.rv}`}>
                {t("b5Kicker")}
              </div>
              <h2 className={`${styles.h2} ${styles.rv} ${styles.d1}`}>
                {t("b5Title")}
              </h2>
              <p className={`${styles.lead} ${styles.rv} ${styles.d2}`}>
                {t("b5Body")}
              </p>
            </div>
            <div className={`${styles.colMedia} ${styles.rv} ${styles.d1}`}>
              <div className={`${styles.media} ${styles.mediaTall}`}>
                {t("imgSel")}
              </div>
            </div>
          </div>
        </section>

        {/* 7 · PRACTICAL */}
        <section className={stepClass(7)}>
          <div className={styles.stepInner}>
            <div className={`${styles.kicker} ${styles.center} ${styles.rv}`}>
              {t("pracKicker")}
            </div>
            <h2
              className={`${styles.h2} ${styles.rv} ${styles.d1}`}
              style={{ textAlign: "center", marginBottom: 30 }}
            >
              {t("pracTitle")}
            </h2>
            <div className={styles.cards}>
              <div className={`${styles.card} ${styles.rv} ${styles.d2}`}>
                <h3>{t("c1Title")}</h3>
                <p>{t("c1Body")}</p>
              </div>
              <div className={`${styles.card} ${styles.rv} ${styles.d3}`}>
                <h3>{t("c2Title")}</h3>
                <p>{t("c2Body")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8 · FORM */}
        <section className={`${stepClass(8)} ${styles.formStep}`}>
          <div className={styles.stepInner}>
            <div className={`${styles.kicker} ${styles.center} ${styles.rv}`}>
              {t("fKicker")}
            </div>
            <h2 className={`${styles.h2} ${styles.rv} ${styles.d1}`}>
              {t("fTitle")}
            </h2>
            <p
              className={`${styles.lead} ${styles.dim} ${styles.rv} ${styles.d2}`}
              style={{ marginInline: "auto" }}
            >
              {t("fSub")}
            </p>

            {submitted ? (
              <div className={styles.formSuccess}>{t("fSuccess")}</div>
            ) : (
              <form
                className={`${styles.rv} ${styles.d2}`}
                onSubmit={handleSubmit}
              >
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>{t("fNameLabel")}</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder={t("fNamePh")}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>{t("fPhoneLabel")}</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder={t("fPhonePh")}
                    />
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <label>{t("fEmailLabel")}</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder={t("fEmailPh")}
                    />
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <label>{t("fMsgLabel")}</label>
                    <textarea
                      name="message"
                      rows={2}
                      placeholder={t("fMsgPh")}
                    />
                  </div>
                </div>
                <button type="submit" className={styles.submit}>
                  {t("fBtn")}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* chrome: progress dots */}
      <div className={styles.dots}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            aria-label={`${i + 1}`}
            className={i === cur ? styles.on : undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* counter */}
      <div className={styles.counter}>
        <span className={styles.cur}>{String(cur + 1).padStart(2, "0")}</span> /{" "}
        {String(TOTAL).padStart(2, "0")}
      </div>

      {/* scroll cue (step 0 only) */}
      <button
        className={`${styles.cue}${cur !== 0 ? ` ${styles.hide}` : ""}`}
        onClick={next}
        aria-label={t("scroll")}
      >
        <span>{t("scroll")}</span>
        <span className={styles.cueLine} />
      </button>
    </div>
  );
}
