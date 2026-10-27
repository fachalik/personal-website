"use client";

import { useTranslations } from "next-intl";
import { Icons } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const TAP = "inline-block transition-transform active:scale-90";

export default function Navbar() {
  const t = useTranslations("Nav");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 flex h-full max-h-14 origin-bottom">
      <div className="bg-background dark:bg-background fixed inset-x-0 bottom-0 h-16 w-full to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)]"></div>
      <Dock className="bg-background pointer-events-auto relative z-50 mx-auto flex h-full min-h-full transform-gpu items-center px-1 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:[border:1px_solid_rgba(255,255,255,.1)]">
        {DATA.navbar.map((item) => (
          <DockIcon key={item.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={TAP}>
                  <Link
                    href={item.href}
                    aria-label={t(item.label)}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12",
                    )}
                  >
                    <item.icon className="size-4" />
                  </Link>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t(item.label)}</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        ))}
        <Separator orientation="vertical" className="h-full" />
        {Object.entries(DATA.contact.social)
          .filter(([_, social]) => social.navbar)
          .map(([name, social]) => (
            <DockIcon key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={TAP}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12",
                      )}
                    >
                      <social.icon className="size-4" />
                    </a>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={TAP}>
                <a
                  target="_blank"
                  href="/cv-fachalik.pdf"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12",
                  )}
                  download
                  rel="noopener"
                  aria-label={t("downloadCv")}
                >
                  <Icons.newspaper className="size-4" />
                </a>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("downloadCv")}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <Separator orientation="vertical" className="h-full py-2" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <LanguageSwitcher />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("language")}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("theme")}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </div>
  );
}
