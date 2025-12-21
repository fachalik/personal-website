"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { DATA } from "@/data/resume";
import { Masonry } from "react-plock";

const BLUR_FADE_DELAY = 0.04;

export function ProjectListCard() {
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
            description={project.description}
            dates={project.dates}
            tags={project.technologies}
            image={project.image}
            video={project.video}
            links={project.links}
          />
        </BlurFade>
      )}
    />
  );
}
