import { useTranslations } from "next-intl";
import Markdown from "react-markdown";
import BlurFade from "@/components/magicui/blur-fade";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";

export function AboutSection() {
  const t = useTranslations("About");
  return (
    <section id="about">
      <BlurFade delay={BLUR_FADE_DELAY * 3}>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 4}>
        <Markdown className="prose dark:prose-invert text-muted-foreground max-w-full font-sans text-sm text-pretty">
          {t("summary", { name: DATA.name, years: DATA.yearsOfExperience })}
        </Markdown>
      </BlurFade>
    </section>
  );
}
