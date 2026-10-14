"use client";

import { Check, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icons } from "@/components/icons";

const buttonClass =
  "inline-flex size-9 items-center justify-center rounded-full border bg-card/60 text-muted-foreground backdrop-blur-sm transition-colors hover:border-foreground/30 hover:text-foreground";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations("Blog");
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={buttonClass}
        aria-label={copied ? t("copied") : t("copyLink")}
        title={copied ? t("copied") : t("copyLink")}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      </button>
      <a
        className={buttonClass}
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X"
      >
        <Icons.x className="size-3.5" />
      </a>
      <a
        className={buttonClass}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <Icons.linkedin className="size-3.5" />
      </a>
    </div>
  );
}
