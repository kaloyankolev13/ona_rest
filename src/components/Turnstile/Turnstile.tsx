"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileTheme = "light" | "dark" | "auto";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: (code: string) => void;
  "timeout-callback"?: () => void;
  theme?: TurnstileTheme;
  size?: "normal" | "compact" | "flexible";
  appearance?: "always" | "execute" | "interaction-only";
  action?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement | string,
        options: TurnstileRenderOptions
      ) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
      getResponse: (id?: string) => string | undefined;
    };
  }
}

export interface TurnstileHandle {
  reset: () => void;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: TurnstileTheme;
  action?: string;
  className?: string;
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(
  function Turnstile(
    { onVerify, onExpire, onError, theme = "auto", action, className },
    ref
  ) {
    const t = useTranslations("Turnstile");
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [generation, setGeneration] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onVerifyRef.current = onVerify;
      onExpireRef.current = onExpire;
      onErrorRef.current = onError;
    }, [onVerify, onExpire, onError]);

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          setErrorCode(null);
          onExpireRef.current?.();
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
        },
      }),
      []
    );

    useEffect(() => {
      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      if (!siteKey) {
        console.warn(
          "NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set — Turnstile widget will not render."
        );
        return;
      }
      if (!containerRef.current) return;

      let cancelled = false;
      const target = containerRef.current;

      loadTurnstileScript()
        .then(() => {
          if (cancelled || !window.turnstile) return;
          widgetIdRef.current = window.turnstile.render(target, {
            sitekey: siteKey,
            callback: (token: string) => {
              if (cancelled) return;
              setErrorCode(null);
              onVerifyRef.current(token);
            },
            "timeout-callback": () => onExpireRef.current?.(),
            "expired-callback": () => onExpireRef.current?.(),
            "error-callback": (code: string) => {
              if (cancelled) return;
              setErrorCode(code);
              console.warn("Turnstile verification failed", { code, action });
              onErrorRef.current?.();
            },
            size: "flexible",
            theme,
            action,
          });
        })
        .catch((err) => {
          console.error(err);
          onErrorRef.current?.();
        });

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
          }
          widgetIdRef.current = null;
        }
      };
    }, [theme, action, generation]);

    return (
      <div className={className}>
        <div ref={containerRef} />
        {errorCode && (
          <div role="alert">
            <p>{t("failed", { code: errorCode })}</p>
            <button type="button" onClick={() => {
              onExpireRef.current?.();
              setErrorCode(null);
              setGeneration(value => value + 1);
            }}>{t("retry")}</button>
          </div>
        )}
      </div>
    );
  }
);
