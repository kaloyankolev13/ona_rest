import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Animate letters sliding up from below, staggered, when the trigger
 * element scrolls into view. Each letter should be a child element
 * with the class provided by `letterSelector`.
 */
export function animateLettersOnScroll(
  trigger: Element,
  letterSelector: string,
  options?: {
    delay?: number;
    duration?: number;
    stagger?: number;
    start?: string;
  }
) {
  const letters = trigger.querySelectorAll<HTMLElement>(letterSelector);
  if (!letters.length) return;

  const {
    delay = 0,
    duration = 0.4,
    stagger = 0.03,
    start = "top 85%",
  } = options ?? {};

  gsap.set(letters, { opacity: 0, y: "100%" });

  gsap.to(letters, {
    opacity: 1,
    y: "0%",
    duration,
    ease: "power2.out",
    stagger,
    delay,
    scrollTrigger: {
      trigger,
      start,
      toggleActions: "play none none none",
    },
  });
}

/**
 * Fade-and-slide an element into view when it scrolls on screen.
 * Works well for images, cards, or any block element.
 */
export function animateRevealOnScroll(
  elements: Element | Element[] | NodeListOf<Element>,
  options?: {
    y?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    delay?: number;
  }
) {
  const {
    y = 60,
    duration = 0.7,
    stagger = 0.2,
    start = "top 85%",
    delay = 0,
  } = options ?? {};

  const targets =
    elements instanceof NodeList ? Array.from(elements) : elements;

  gsap.set(targets, { opacity: 0, y });

  gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration,
    ease: "power2.out",
    stagger,
    delay,
    scrollTrigger: {
      trigger: Array.isArray(targets) ? targets[0] : targets,
      start,
      toggleActions: "play none none none",
    },
  });
}
