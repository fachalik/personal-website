import { DownloadIcon, MailIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { cn } from "@/lib/utils";

// The paper is listed with the projects but counts as a publication, not a build.
const builtProjects = DATA.projects.filter(
  (project) => project.href !== DATA.publicationUrl,
).length;

export function HeroSection() {
  const t = useTranslations("Hero");

  const stats = [
    { value: DATA.yearsOfExperience, suffix: "+", label: t("stats.years") },
    { value: DATA.work.length, label: t("stats.companies") },
    { value: builtProjects, label: t("stats.projects") },
  ];

  return (
    <section id="hero">
      <div className="mx-auto w-full max-w-2xl space-y-8 md:max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="order-2 flex flex-1 flex-col space-y-1.5 sm:order-1">
            {DATA.openToWork && (
              <BlurFade delay={BLUR_FADE_DELAY}>
                <span className="mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium text-xs">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  {t("openToWork")}
                </span>
              </BlurFade>
            )}
            <BlurFadeText
              delay={BLUR_FADE_DELAY}
              className="font-bold font-display text-3xl tracking-tighter sm:text-5xl xl:text-6xl/none"
              yOffset={8}
              text={t("greeting", { name: DATA.name })}
            />
            <BlurFadeText
              className="max-w-[600px] md:text-xl"
              delay={BLUR_FADE_DELAY}
              text={t("description")}
            />
          </div>
          {/* Not animated: it's the LCP element, so it should paint immediately. */}
          <Avatar className="order-1 size-20 border sm:order-2 sm:size-28">
            <Image
              src={DATA.avatarUrl}
              alt={DATA.name}
              width={112}
              height={112}
              sizes="(min-width: 640px) 112px, 80px"
              fetchPriority="high"
              loading="eager"
              className="aspect-square size-full object-cover"
            />
          </Avatar>
        </div>

        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="flex flex-wrap gap-2">
            <a
              href={DATA.cvUrl}
              download
              className={cn(buttonVariants({ size: "sm" }), "gap-2")}
            >
              <DownloadIcon className="size-4" />
              {t("downloadCv")}
            </a>
            <a
              href={`mailto:${DATA.contact.email}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2",
              )}
            >
              <MailIcon className="size-4" />
              {t("email")}
            </a>
          </div>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 2.5}>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col bg-background p-3">
                <NumberTicker
                  value={stat.value}
                  suffix={stat.suffix}
                  delay={BLUR_FADE_DELAY * 2.5}
                  className="font-bold font-display text-2xl tracking-tight"
                />
                <span className="text-muted-foreground text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
