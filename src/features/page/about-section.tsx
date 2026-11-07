import { useTranslations } from "next-intl";
import Markdown from "react-markdown";
import { DATA } from "@/data/resume";

export function AboutSection() {
  const t = useTranslations("About");
  return (
    <section id="about">
      {/* Not animated: on phones this paragraph is the LCP element. */}
      <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
      <Markdown className="prose dark:prose-invert text-muted-foreground max-w-full font-sans text-sm text-pretty">
        {t("summary", { name: DATA.name, years: DATA.yearsOfExperience })}
      </Markdown>
    </section>
  );
}
