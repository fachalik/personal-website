"use client";

import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "themeLight", icon: SunIcon },
  { value: "dark", label: "themeDark", icon: MoonIcon },
  { value: "system", label: "themeSystem", icon: DesktopIcon },
] as const;

export function ModeToggle(props: ComponentProps<typeof Button>) {
  const t = useTranslations("Nav");
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu modal={false}>
      {/* Props go on the Trigger so Radix composes them with its own handlers (e.g. TooltipTrigger's). */}
      <DropdownMenuTrigger asChild {...props}>
        <Button
          variant="ghost"
          type="button"
          size="icon"
          className="px-2"
          aria-label={t("theme")}
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200" />
          <MoonIcon className="hidden h-[1.2rem] w-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon />
              {t(label)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
