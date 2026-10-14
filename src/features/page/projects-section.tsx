import { useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import { ProjectListCard } from "@/components/projects-list-card";
import { BLUR_FADE_DELAY } from "@/lib/constants";

export function ProjectsSection() {
  const t = useTranslations("Projects");
  return (
    <section id="projects">
      <div className="w-full space-y-12 py-12">
        <BlurFade delay={BLUR_FADE_DELAY * 12}>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-background text-sm">
                {t("badge")}
              </div>
              <h2 className="font-bold text-3xl tracking-tighter sm:text-5xl">
                {t("title")}
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t("description")}
              </p>
            </div>
          </div>
        </BlurFade>
        <ProjectListCard />
      </div>
    </section>
  );
}
