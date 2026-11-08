import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import BlurFade from "@/components/magicui/blur-fade";
import { ProjectListCard } from "@/components/projects-list-card";
import { BLUR_FADE_DELAY } from "@/lib/constants";

export async function ProjectsSection() {
  const t = await getTranslations("Projects");
  const { Resume, Work } = await getMessages();
  return (
    <section id="projects">
      <div className="w-full space-y-12 py-12">
        <BlurFade delay={BLUR_FADE_DELAY * 11}>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="bg-foreground text-background inline-block rounded-lg px-3 py-1 text-sm">
                {t("badge")}
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                {t("title")}
              </h2>
            </div>
          </div>
        </BlurFade>
        {/* The only client component that needs these; the layout leaves them out. */}
        <NextIntlClientProvider messages={{ Resume, Work }}>
          <ProjectListCard />
        </NextIntlClientProvider>
      </div>
    </section>
  );
}
