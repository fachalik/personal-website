import { Credits } from "@/components/credits";
import { AboutSection } from "@/features/page/about-section";
import { ContactSection } from "@/features/page/contact-section";
import { EducationSection } from "@/features/page/education-section";
import { HeroSection } from "@/features/page/hero-section";
import { ProjectsSection } from "@/features/page/projects-section";
import { SkillsSection } from "@/features/page/skills-section";
import { WorkSection } from "@/features/page/work-section";

export default function Page() {
  return (
    <main className="flex flex-col min-h-[100dvh] space-y-14 md:space-y-20">
      <HeroSection />
      <AboutSection />
      <WorkSection />
      <EducationSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
      <Credits />
    </main>
  );
}
