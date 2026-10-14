import { useLocale, useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import { ResumeCard } from "@/components/resume-card";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { formatPeriod } from "@/lib/utils";

export function WorkSection() {
  const t = useTranslations("Work");
  const tResume = useTranslations("Resume.work");
  const locale = useLocale();
  return (
    <section id="work">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={BLUR_FADE_DELAY * 7}>
          <h2 className="font-bold text-2xl tracking-tight">{t("title")}</h2>
        </BlurFade>
        {DATA.work.map((work, id) => {
          const company =
            "confidential" in work && work.confidential
              ? t("confidential")
              : work.company;
          return (
            <BlurFade key={work.key} delay={BLUR_FADE_DELAY * 8 + id * 0.05}>
              <ResumeCard
                logoUrl={work.logoUrl}
                altText={company}
                title={company}
                subtitle={tResume(`${work.key}.title`)}
                href={work.href}
                badges={work.badges}
                period={formatPeriod(
                  work.start,
                  work.end,
                  locale,
                  t("present"),
                )}
                description={tResume(`${work.key}.description`)}
                defaultExpanded={id === 0}
              />
            </BlurFade>
          );
        })}
      </div>
    </section>
  );
}
