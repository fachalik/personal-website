"use client";

import { AnimatePresence, motion } from "framer-motion";
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
      aria-label={t("copyEmail")}
      className={cn(
        "group inline-flex h-10 items-center overflow-hidden rounded-full border bg-background/60 text-sm shadow-sm backdrop-blur-sm transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        copied && "border-emerald-500/50 hover:border-emerald-500/50",
        className,
      )}
    >
      <span className="flex items-center gap-2 py-2 pr-3 pl-4 font-mono text-muted-foreground transition-colors group-hover:text-foreground">
        <Mail className="size-3.5 shrink-0" />
        {email}
      </span>
      <span
        className={cn(
          "flex h-full items-center gap-1.5 border-l px-3 font-medium text-xs transition-colors",
          copied
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-foreground/[0.03] text-muted-foreground group-hover:bg-foreground/[0.06] group-hover:text-foreground",
        )}
      >
        <span className="relative size-3.5">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={copied ? "check" : "copy"}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0"
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        {/* Both labels share one grid cell so the pill never changes width. */}
        <span className="grid">
          <span
            className={cn(
              "col-start-1 row-start-1 transition-opacity",
              copied && "opacity-0",
            )}
          >
            {t("copy")}
          </span>
          <span
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
