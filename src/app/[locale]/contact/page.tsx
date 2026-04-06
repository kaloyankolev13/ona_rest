"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animateRevealOnScroll } from "@/animations/scrollAnimations";
import { SmoothScroll } from "@/components";
import { ShevitsaDecor } from "@/components/ShevitsaDecor/ShevitsaDecor";
import styles from "./Contact.module.css";

gsap.registerPlugin(ScrollTrigger);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const ONA_COORDS: [number, number] = [22.5669, 43.5461];

export default function ContactPage() {
  const t = useTranslations("ContactPage");

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN || mapInstanceRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/kaloyan-kolev/cmnls2w78000a01qydx9f0bew",
      center: ONA_COORDS,
      zoom: 14.5,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const el = document.createElement("div");
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="39" viewBox="0 0 51.44 72">
      <path d="M25.73,0a7.3,7.3,0,1,1-7.29,7.3A7.3,7.3,0,0,1,25.73,0Z" fill="#072b16" fill-rule="evenodd"/>
      <path d="M1,6.39,5.77,2.7c1.05-.76.87-1,1.71.28C11,8.55,16.54,13.73,23.41,18.09,15.8,19.74,7.79,15.8.64,8.2c-1-1.12-.72-1,.33-1.81Z" fill="#072b16" fill-rule="evenodd"/>
      <path d="M50.47,6.39,45.67,2.7c-1.05-.76-.87-1-1.71.28C40.4,8.55,34.9,13.73,28,18.09,35.64,19.74,43.65,15.8,50.8,8.2c1-1.12.72-1-.33-1.81Z" fill="#072b16" fill-rule="evenodd"/>
      <path d="M24.6,21.79A109.58,109.58,0,0,1,3.71,45.33c-.92.8-1.69,1.44,0,2.08C12,50.52,16.91,51.94,26,51.9c7.24.16,14.49-2.19,21.43-4.69,1.45-.52.6-1.4-.14-2.05C38.16,37.1,31.43,29.73,26.37,21.68c-.81-1.3-1.09-.95-1.77.11Z" fill="#072b16" fill-rule="evenodd"/>
      <polygon points="18,56 25.72,70 33.44,56" fill="#072b16"/>
    </svg>`;
    el.style.cursor = "pointer";

    new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(ONA_COORDS)
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          '<strong style="color:#072b16">ONÀ</strong><br/>Стакевци, ул. 31 №1'
        )
      )
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 }
        );
      }

      if (infoRef.current) {
        const blocks = infoRef.current.querySelectorAll(`.${styles.infoBlock}`);
        if (blocks.length) {
          animateRevealOnScroll(blocks, {
            y: 40,
            duration: 0.6,
            stagger: 0.12,
          });
        }
      }

      if (formRef.current) {
        animateRevealOnScroll(formRef.current, {
          y: 50,
          duration: 0.8,
          delay: 0.2,
        });
      }

      if (mapRef.current) {
        animateRevealOnScroll(mapRef.current, {
          y: 60,
          duration: 0.8,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      {/* Hero */}
      <section className={styles.hero}>
        <ShevitsaDecor variant={6} />
        <span className={styles.heroSubtitle}>{t("heroSubtitle")}</span>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>
          {t("heroTitle")}
        </h1>
      </section>

      {/* Map + Podcast */}
      <section className={styles.map}>
        <div className={styles.mapInner}>
          <div className={styles.mapCol}>
            <span className={styles.mapTag}>{t("mapTag")}</span>
            <div ref={mapRef} className={styles.mapContainer}>
              <div ref={mapContainerRef} className={styles.mapCanvas} />
            </div>
          </div>
          <div className={styles.podcastCol}>
            <span className={styles.mapTag}>{t("podcastTag")}</span>
            <p className={styles.podcastText}>{t("podcastText")}</p>
            <iframe
              className={styles.podcastEmbed}
              src="https://open.spotify.com/embed/episode/4LRyX2IkqasxlnfsJ3tlpw?utm_source=generator&t=0"
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Podcast"
            />
          </div>
        </div>
      </section>

      {/* Content: Info + Form */}
      <section className={styles.content}>
        <ShevitsaDecor variant={10} />
        <div className={styles.contentInner}>
          <div ref={infoRef} className={styles.infoColumn}>
            <span className={styles.tag}>{t("infoTag")}</span>

            <div className={styles.infoBlock}>
              <h4 className={styles.infoLabel}>{t("addressLabel")}</h4>
              <p className={styles.infoValue}>{t("addressValue")}</p>
            </div>

            <div className={styles.infoBlock}>
              <h4 className={styles.infoLabel}>{t("phoneLabel")}</h4>
              <p className={styles.infoValue}>{t("phoneValue")}</p>
            </div>

            <div className={styles.infoBlock}>
              <h4 className={styles.infoLabel}>{t("emailLabel")}</h4>
              <p className={styles.infoValue}>{t("emailValue")}</p>
            </div>

            <div className={styles.infoBlock}>
              <h4 className={styles.infoLabel}>{t("hoursLabel")}</h4>
              <p className={styles.infoValue}>{t("hoursTueFri")}</p>
            </div>
          </div>

          <div ref={formRef} className={styles.formColumn}>
            <span className={styles.tag}>{t("formTag")}</span>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t("formName")}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={t("formName")}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t("formEmail")}</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder={t("formEmail")}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("formSubject")}</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={t("formSubject")}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("formMessage")}</label>
                <textarea
                  className={styles.textarea}
                  placeholder={t("formMessage")}
                  rows={5}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                {t("formSend")} <span className={styles.arrow}>→</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </SmoothScroll>
  );
}
