import { useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SkillsSection() {
  const t = useTranslations("Skills");

  return (
    <section id="skills">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <h2 className="font-bold text-2xl tracking-tight">{t("title")}</h2>
        </BlurFade>
        <dl className="divide-y divide-border/60">
          {DATA.skillGroups.map((group, id) => (
            // BlurFade renders the <div> that groups each dt/dd pair, which
            // must be a direct child of <dl>.
            <BlurFade
              key={group.key}
              delay={BLUR_FADE_DELAY * 6 + id * 0.05}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:gap-6"
            >
              <dt className="shrink-0 pt-1 text-muted-foreground text-sm sm:w-44">
                {t(`groups.${group.key}`)}
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {group.items.map((skill) => (
                  <span
                    key={skill.name}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm transition-colors",
                      // The day-to-day stack reads first.
                      "core" in skill && skill.core
                        ? "border-foreground bg-foreground font-medium text-background"
                        : "bg-background/60 hover:border-foreground/30",
                    )}
                  >
                    {"path" in skill.icon ? (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden
                        className="size-3.5 shrink-0 fill-current"
                      >
                        <path d={skill.icon.path} />
                      </svg>
                    ) : (
                      <skill.icon className="size-3.5 shrink-0" aria-hidden />
                    )}
                    {skill.name}
                  </span>
                ))}
              </dd>
            </BlurFade>
          ))}
        </dl>
      </div>
    </section>
  );
}
