"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
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
  const inView = useInView(ref, { once: true, margin: "0px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    if (reduceMotion) {
      node.textContent = `${value}${suffix}`;
      return;
    }
    const controls = animate(0, value, {
      delay,
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = `${Math.round(latest)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, suffix, delay]);

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
