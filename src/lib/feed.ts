import { getTranslations } from "next-intl/server";
import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import { LOCALE_TAGS, type Locale } from "@/i18n/routing";
import { absoluteUrl, localizedPath } from "@/lib/seo";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** A literal `]]>` would end the CDATA section early, so split it across two. */
function cdata(value: string) {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/** RSS 2.0 document for the blog in one locale, newest first. */
export async function buildFeed(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "Blog" });
  const posts = await getBlogPosts(locale);
  const feedUrl = absoluteUrl(localizedPath("/feed.xml", locale));
  const blogUrl = absoluteUrl(localizedPath("/blog", locale));
  const lastBuild = posts[0]
    ? new Date(posts[0].metadata.publishedAt)
    : new Date();

  const items = posts.map((post) => {
    const url = absoluteUrl(localizedPath(`/blog/${post.slug}`, locale));
    return `    <item>
      <title>${escapeXml(post.metadata.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.metadata.summary ?? "")}</description>
      <content:encoded>${cdata(post.source)}</content:encoded>
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(`${t("metaTitle")} | ${DATA.name}`)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(t("metaDescription"))}</description>
    <language>${LOCALE_TAGS[locale].lang}</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>
`;
}

export function feedResponse(xml: string) {
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
