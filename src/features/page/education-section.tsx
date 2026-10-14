import { useLocale, useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import { ResumeCard } from "@/components/resume-card";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { formatPeriod } from "@/lib/utils";

export function EducationSection() {
  const t = useTranslations("Education");
  const tResume = useTranslations("Resume.education");
  const locale = useLocale();
  return (
    <section id="education">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={BLUR_FADE_DELAY * 9}>
          <h2 className="font-bold text-2xl tracking-tight">{t("title")}</h2>
        </BlurFade>
        {DATA.education.map((education, id) => (
          <BlurFade
            key={education.school}
            delay={BLUR_FADE_DELAY * 10 + id * 0.05}
          >
            <ResumeCard
              href={education.href}
              logoUrl={education.logoUrl}
              altText={education.school}
              title={education.school}
              subtitle={tResume(`${education.key}.degree`)}
              period={formatPeriod(education.start, education.end, locale)}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
