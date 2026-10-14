"use client";

import { useLocale, useTranslations } from "next-intl";
import { type ComponentProps, useTransition } from "react";
import { FLAGS } from "@/components/flags";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";

// Each language is named in itself, so it's recognizable whatever the current locale.
const NAMES: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

const FLAG_CLASS =
  "h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,.1)]";

export function LanguageSwitcher(props: ComponentProps<typeof Button>) {
  const t = useTranslations("Nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const CurrentFlag = FLAGS[locale];

  return (
    <DropdownMenu modal={false}>
      {/* Props go on the Trigger so Radix composes them with its own handlers (e.g. TooltipTrigger's). */}
      <DropdownMenuTrigger asChild {...props}>
        <Button
          variant="ghost"
          type="button"
          size="icon"
          className="px-2"
          aria-label={t("language")}
          disabled={isPending}
        >
          <CurrentFlag className={FLAG_CLASS} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(next) => {
            startTransition(() => {
              router.replace(pathname, {
                locale: next as Locale,
                scroll: false,
              });
            });
          }}
        >
          {routing.locales.map((value) => {
            const Flag = FLAGS[value];
            return (
              <DropdownMenuRadioItem key={value} value={value} lang={value}>
                <Flag className={FLAG_CLASS} />
                {NAMES[value]}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
