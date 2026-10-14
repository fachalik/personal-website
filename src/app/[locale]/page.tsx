import { setRequestLocale } from "next-intl/server";
import { Credits } from "@/components/credits";
import { PersonStructuredData } from "@/components/structured-data";
import { AboutSection } from "@/features/page/about-section";
import { ContactSection } from "@/features/page/contact-section";
import { EducationSection } from "@/features/page/education-section";
import { GithubSection } from "@/features/page/github-section";
import { HeroSection } from "@/features/page/hero-section";
import { ProjectsSection } from "@/features/page/projects-section";
import { SkillsSection } from "@/features/page/skills-section";
import { WorkSection } from "@/features/page/work-section";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-[100dvh] flex-col space-y-14 md:space-y-20">
      <PersonStructuredData />
      <HeroSection />
      <AboutSection />
      <WorkSection />
      <ProjectsSection />
      <SkillsSection />
      <GithubSection />
      <EducationSection />
      <ContactSection />
      <Credits />
    </main>
  );
}
