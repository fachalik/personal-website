import type { MetadataRoute } from "next";
import { getBlogPosts, getTags } from "@/data/blog";
import { type Locale, routing } from "@/i18n/routing";
import { absoluteUrl, languageAlternates, localizedPath } from "@/lib/seo";

function entry(
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  locales: readonly Locale[] = routing.locales,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path, locales)).map(([k, v]) => [
      k,
      absoluteUrl(v),
    ]),
  );
  return locales.map((locale) => ({
    url: absoluteUrl(localizedPath(path, locale)),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  const latestPost = posts[0]
    ? new Date(posts[0].metadata.publishedAt)
    : new Date();

  return [
    ...entry("/", new Date(), "monthly", 1),
    ...entry("/blog", latestPost, "weekly", 0.8),
    // Only list the translations that actually exist; fallbacks canonicalize to English.
    ...posts.flatMap((post) =>
      entry(
        `/blog/${post.slug}`,
        new Date(post.metadata.publishedAt),
        "yearly",
        0.6,
        post.availableLocales,
      ),
    ),
    ...getTags(posts).flatMap(({ tag }) =>
      entry(`/blog/tag/${tag}`, latestPost, "weekly", 0.4),
    ),
  ];
}
