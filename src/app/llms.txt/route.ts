import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import { absoluteUrl } from "@/lib/seo";

// Posts only change on deploy, so render this once at build time.
export const dynamic = "force-static";

/** https://llmstxt.org — a plain-markdown map of the site for AI agents. */
export async function GET() {
  const posts = await getBlogPosts();

  const body = [
    `# ${DATA.name}`,
    "",
    `> ${DATA.description} Based in ${DATA.location}.`,
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): About, skills, work experience, education and projects`,
    `- [Blog](${absoluteUrl("/blog")}): Articles on frontend engineering and tooling`,
    `- [Indonesian version](${absoluteUrl("/id")}): The same site in Bahasa Indonesia`,
    `- [CV (PDF)](${absoluteUrl(DATA.cvUrl)})`,
    `- [RSS feed](${absoluteUrl("/feed.xml")})`,
    "",
    "## Blog posts",
    "",
    ...posts.map(
      (post) =>
        `- [${post.metadata.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.metadata.summary}`,
    ),
    "",
    "## Contact",
    "",
    `- Email: ${DATA.contact.email}`,
    ...Object.values(DATA.contact.social)
      .filter((social) => social.navbar)
      .map((social) => `- ${social.name}: ${social.url}`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
