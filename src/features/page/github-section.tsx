import { GithubActivityGraph } from "@/components/github-activity";
import BlurFade from "@/components/magicui/blur-fade";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { getMergedGithubActivity } from "@/lib/github";

export async function GithubSection() {
  const activity = await getMergedGithubActivity(DATA.githubAccounts);

  // GitHub being unreachable should cost a section, not the page.
  if (!activity) return null;

  return (
    <section id="github">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={BLUR_FADE_DELAY * 11}>
          <h2 className="text-2xl font-bold tracking-tight">GitHub Activity</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 11.5}>
          <GithubActivityGraph data={activity} />
        </BlurFade>
      </div>
    </section>
  );
}
