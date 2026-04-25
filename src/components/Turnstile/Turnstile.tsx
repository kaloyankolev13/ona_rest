"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileTheme = "light" | "dark" | "auto";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
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
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
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
            callback: (token: string) => onVerifyRef.current(token),
            "expired-callback": () => onExpireRef.current?.(),
            "error-callback": () => onErrorRef.current?.(),
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
    }, [theme, action]);

    return <div ref={containerRef} className={className} />;
  }
);
