import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PostBrowser } from "@/components/blog/post-browser";
import { TagFilter } from "@/components/blog/post-list";
import { getBlogPosts, getTags, toSummary } from "@/data/blog";
import { LOCALE_TAGS, routing } from "@/i18n/routing";
import {
  absoluteUrl,
  feedAlternate,
  languageAlternates,
  localizedPath,
  ogImageUrl,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Blog" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath("/blog", locale),
      languages: languageAlternates("/blog"),
      types: feedAlternate(locale),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: LOCALE_TAGS[locale].og,
      url: absoluteUrl(localizedPath("/blog", locale)),
      images: [
        { url: ogImageUrl(title), width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl(title)],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const t = await getTranslations("Blog");
  const posts = await getBlogPosts(locale);
  return (
    <section className="blog-wide space-y-8 pb-16">
      <header className="space-y-3">
        <h1 className="font-display text-4xl leading-tight font-bold tracking-tighter sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg/relaxed text-pretty">
          {t("metaDescription")}
        </p>
        <p className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span>{t("postCount", { count: posts.length })}</span>
          <a
            href={localizedPath("/feed.xml", locale)}
            className="hover:text-foreground inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:underline"
          >
            <Rss className="size-3.5" />
            {t("rss")}
          </a>
        </p>
      </header>

      <TagFilter tags={getTags(posts)} />
      <PostBrowser posts={posts.map(toSummary)} lead />
    </section>
  );
}
