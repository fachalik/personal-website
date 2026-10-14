"use client";

import { useLocale, useTranslations } from "next-intl";
import { Masonry } from "react-plock";
import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { DATA } from "@/data/resume";
import { formatPeriod } from "@/lib/utils";

const BLUR_FADE_DELAY = 0.04;

export function ProjectListCard() {
  const t = useTranslations("Resume");
  const tWork = useTranslations("Work");
  const locale = useLocale();

  return (
    <Masonry
      items={[...DATA.projects]}
      config={{
        columns: [1, 2],
        gap: [24, 12],
        media: [640, 768],
      }}
      render={(project, id) => (
        <BlurFade key={project.title} delay={BLUR_FADE_DELAY * 12 + id * 0.05}>
          <ProjectCard
            href={project.href}
            key={project.title}
            title={project.title}
            description={t(`projects.${project.key}.description`)}
            dates={formatPeriod(
              project.start,
              undefined,
              locale,
              "ongoing" in project ? tWork("present") : undefined,
            )}
            tags={project.technologies}
            image={project.image}
            video={project.video}
            links={project.links.map((link) => ({
              ...link,
              type: t(`links.${link.type}`),
            }))}
          />
        </BlurFade>
      )}
    />
  );
}
