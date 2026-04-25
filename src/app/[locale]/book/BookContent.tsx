"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animateRevealOnScroll } from "@/animations/scrollAnimations";
import { SmoothScroll, Turnstile, type TurnstileHandle } from "@/components";
import { ShevitsaDecor } from "@/components/ShevitsaDecor/ShevitsaDecor";
import styles from "./Book.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function BookContent() {
  const t = useTranslations("BookPage");
  const guestOptions = t.raw("guestOptions") as string[];

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error" | "captcha"
  >("idle");
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

  const emailError = touched.email && email.length > 0 && !EMAIL_RE.test(email)
    ? t("errorInvalidEmail")
    : undefined;
  const phoneError = touched.phone && phone.length > 0 && !PHONE_RE.test(phone)
    ? t("errorInvalidPhone")
    : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setTouched({ email: true, phone: true });
    if (!EMAIL_RE.test(email) || !PHONE_RE.test(phone)) return;
    if (!captchaToken) {
      setStatus("captcha");
      return;
    }
    setStatus("sending");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, date, guests, notes, captchaToken }),
      });

      if (!res.ok) throw new Error();

      setStatus("success");
      setDate("");
      setGuests(1);
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    } catch {
      setStatus("error");
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 }
        );
      }

      if (formRef.current) {
        animateRevealOnScroll(formRef.current, {
          y: 50,
          duration: 0.8,
          start: "top 90%",
        });
      }

      if (infoRef.current) {
        const cards = infoRef.current.querySelectorAll(`.${styles.infoCard}`);
        if (cards.length) {
          animateRevealOnScroll(cards, {
            y: 50,
            duration: 0.7,
            stagger: 0.15,
          });
        }
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      <section className={styles.hero}>
        <span className={styles.heroSubtitle}>{t("heroSubtitle")}</span>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>
          {t("heroTitle")}
        </h1>
        <p className={styles.heroIntro}>{t("introText")}</p>
      </section>

      <section className={styles.detailsSection}>
        <div className={styles.detailsInner}>
          <div className={styles.detailsIntro}>
            <p>{t("detailsIntro1")}</p>
            <p>{t("detailsIntro2")}</p>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsBlock}>
              <h3 className={styles.detailsTitle}>{t("dinnerTitle")}</h3>
              <p className={styles.detailsText}>{t("dinner1")}</p>
              <p className={styles.detailsText}>{t("dinner2")}</p>
              <p className={styles.detailsText}>{t("dinner3")}</p>
            </div>
            <div className={styles.detailsBlock}>
              <h3 className={styles.detailsTitle}>{t("drinksTitle")}</h3>
              <p className={styles.detailsText}>{t("drinksIntro")}</p>
              <p className={styles.detailsText}>{t("drinksWine")}</p>
              <p className={styles.detailsText}>{t("drinksNonAlc")}</p>
            </div>
            <div className={styles.detailsBlock}>
              <h3 className={styles.detailsTitle}>{t("detailsSmallTitle")}</h3>
              <p className={styles.detailsText}>{t("detailsSlippers")}</p>
              <p className={styles.detailsText}>{t("detailsChildren")}</p>
              <p className={styles.detailsText}>{t("detailsPets")}</p>
            </div>
            <div className={styles.detailsBlock}>
              <h3 className={styles.detailsTitle}>{t("stayTitle")}</h3>
              <p className={styles.detailsText}>{t("stay1")}</p>
              <p className={styles.detailsText}>{t("stay2")}</p>
              <p className={styles.detailsText}>{t("stay3")}</p>
              <p className={styles.detailsText}>{t("stay4")}</p>
            </div>
          </div>

          <div className={styles.detailsPricing}>
            <h3 className={styles.detailsTitle}>{t("pricesTitle")}</h3>
            <ul className={styles.priceList}>
              <li>{t("priceDinner")}</li>
              <li>{t("priceWine")}</li>
              <li>{t("priceNonAlc")}</li>
              <li>{t("priceBreakfast")}</li>
            </ul>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsBlock}>
              <h3 className={styles.detailsTitle}>{t("reservationsTitle")}</h3>
              <p className={styles.detailsText}>{t("res1")}</p>
              <p className={styles.detailsText}>{t("res2")}</p>
              <p className={styles.detailsText}>{t("res3")}</p>
              <p className={styles.detailsText}>{t("res4")}</p>
              <p className={styles.detailsText}>{t("res5")}</p>
            </div>
            <div className={styles.detailsBlock}>
              <h3 className={styles.detailsTitle}>{t("noteTitle")}</h3>
              <p className={styles.detailsText}>{t("note1")}</p>
              <p className={styles.detailsText}>{t("note2")}</p>
            </div>
          </div>

          <p className={styles.detailsContact}>{t("detailsContact")}</p>
        </div>
      </section>

      <section className={styles.formSection}>
        <ShevitsaDecor variant={7} />
        <div ref={formRef} className={styles.formInner}>
          <span className={styles.tag}>{t("formTag")}</span>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldDate")}</label>
                <input type="date" className={styles.input} value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldGuests")}</label>
                <select className={styles.select} value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                  {guestOptions.map((opt, i) => (<option key={i} value={i + 1}>{opt}</option>))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldName")}</label>
                <input type="text" className={styles.input} placeholder={t("fieldName")} value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("fieldPhone")}</label>
                <input
                  type="tel"
                  className={`${styles.input} ${phoneError ? styles.inputError : ""}`}
                  placeholder={t("fieldPhone")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  required
                />
                {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t("fieldEmail")}</label>
              <input
                type="email"
                className={`${styles.input} ${emailError ? styles.inputError : ""}`}
                placeholder={t("fieldEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                required
              />
              {emailError && <span className={styles.fieldError}>{emailError}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t("fieldNotes")}</label>
              <textarea className={styles.textarea} placeholder={t("fieldNotes")} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <Turnstile
              ref={turnstileRef}
              onVerify={(token) => {
                setCaptchaToken(token);
                if (status === "captcha") setStatus("idle");
              }}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />

            <button type="submit" className={styles.submitBtn} disabled={status === "sending"}>
              {status === "sending" ? t("formSending") : (<>{t("submitBtn")} <span className={styles.arrow}>→</span></>)}
            </button>

            {status === "success" && (<p className={styles.formFeedback} data-success>{t("formSuccess")}</p>)}
            {status === "error" && (<p className={styles.formFeedback} data-error>{t("formError")}</p>)}
            {status === "captcha" && (<p className={styles.formFeedback} data-error>{t("errorCaptcha")}</p>)}
          </form>
        </div>
      </section>

      <section className={styles.infoSection}>
        <ShevitsaDecor variant={8} />
        <div className={styles.infoInner}>
          <span className={styles.tag} style={{ color: "rgba(51,51,51,0.45)" }}>{t("infoTag")}</span>
          <div ref={infoRef} className={styles.infoGrid}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.infoCard}>
                <div className={styles.infoIcon} />
                <h3 className={styles.infoTitle}>{t(`info${n}Title` as "info1Title")}</h3>
                <p className={styles.infoText}>{t(`info${n}Text` as "info1Text")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SmoothScroll>
  );
}
