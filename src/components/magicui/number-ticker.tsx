"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  suffix?: string;
  /** Seconds to wait after scrolling into view. */
  delay?: number;
  className?: string;
}

/** Counts up from 0 to `value` once it scrolls into view. */
export function NumberTicker({
  value,
  suffix = "",
  delay = 0,
  className,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const render = (n: number) => {
      node.textContent = `${Math.round(n)}${suffix}`;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(value);
      return;
    }

    let frame = 0;
    let timeout = 0;
    const run = () => {
      const duration = 1200;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        // easeOutExpo, close to the old cubic-bezier(0.16, 1, 0.3, 1).
        render(value * (t === 1 ? 1 : 1 - 2 ** (-10 * t)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      timeout = window.setTimeout(run, delay * 1000);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [value, suffix, delay]);

  return (
    <span className={cn("tabular-nums", className)}>
      {/* Screen readers get the final value, not every intermediate frame. */}
      <span className="sr-only">{`${value}${suffix}`}</span>
      <span ref={ref} aria-hidden>
        {`0${suffix}`}
      </span>
    </span>
  );
}
