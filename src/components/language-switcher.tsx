"use client";

import { useLocale, useTranslations } from "next-intl";
import { type ComponentProps, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const next = routing.locales.find((l) => l !== locale) ?? locale;

  return (
    <Button
      variant="ghost"
      type="button"
      size="icon"
      aria-label={t("language")}
      disabled={isPending}
      className={cn(
        "px-2 font-mono font-semibold text-[11px] tracking-wider",
        className,
      )}
      {...props}
      // Radix's TooltipTrigger injects its own onClick; compose instead of letting it win.
      onClick={(event) => {
        onClick?.(event);
        startTransition(() => {
          router.replace(pathname, { locale: next, scroll: false });
        });
      }}
    >
      {t("switchTo")}
    </Button>
  );
}
