"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * `mailto:` does nothing for visitors without a mail client set up, so give
 * them a one-click copy of the address instead.
 */
export function CopyEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const t = useTranslations("Contact");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard blocked (insecure context, permissions): fall back to mail.
      window.location.href = `mailto:${email}`;
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "group bg-background/60 hover:border-foreground/30 focus-visible:ring-ring inline-flex h-10 items-center overflow-hidden rounded-full border text-sm shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
        copied && "border-emerald-500/50 hover:border-emerald-500/50",
        className,
      )}
    >
      <span className="text-muted-foreground group-hover:text-foreground flex items-center gap-2 py-2 pr-3 pl-4 font-mono transition-colors">
        <Mail className="size-3.5 shrink-0" />
        {email}
      </span>
      <span
        className={cn(
          "flex h-full items-center gap-1.5 border-l px-3 text-xs font-medium transition-colors",
          copied
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-foreground/[0.03] text-muted-foreground group-hover:bg-foreground/[0.06] group-hover:text-foreground",
        )}
      >
        <span className="relative size-3.5">
          {/* Both icons stay mounted and cross-fade. */}
          <Copy
            className={cn(
              "absolute inset-0 size-3.5 transition-[opacity,transform] duration-150",
              copied && "scale-50 opacity-0",
            )}
          />
          <Check
            className={cn(
              "absolute inset-0 size-3.5 transition-[opacity,transform] duration-150",
              !copied && "scale-50 opacity-0",
            )}
          />
        </span>
        {/* Both labels share one grid cell so the pill never changes width. */}
        <span className="grid">
          {/* The accessible name is the visible text, so hide the faded label. */}
          <span
            aria-hidden={copied}
            className={cn(
              "col-start-1 row-start-1 transition-opacity",
              copied && "opacity-0",
            )}
          >
            {t("copy")}
          </span>
          <span
            aria-hidden={!copied}
            className={cn(
              "col-start-1 row-start-1 transition-opacity",
              !copied && "opacity-0",
            )}
          >
            {t("copied")}
          </span>
        </span>
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? t("emailCopied") : ""}
      </span>
    </button>
  );
}
