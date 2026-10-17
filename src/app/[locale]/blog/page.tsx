import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PostBrowser } from "@/components/blog/post-browser";
import { TagFilter } from "@/components/blog/post-list";
import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts, getTags, toSummary } from "@/data/blog";
import { LOCALE_TAGS, routing } from "@/i18n/routing";
import { BLUR_FADE_DELAY } from "@/lib/constants";
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
    <section className="space-y-12">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="space-y-3">
          <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-background text-sm">
            {t("badge")}
          </div>
          <h1 className="font-bold text-3xl tracking-tighter sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-muted-foreground md:text-lg/relaxed">
            {t("metaDescription")}{" "}
            <span className="whitespace-nowrap">
              {t("postCount", { count: posts.length })}
            </span>
          </p>
          <a
            href={localizedPath("/feed.xml", locale)}
            className="inline-flex items-center gap-1.5 text-muted-foreground text-sm underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <Rss className="size-3.5" />
            {t("rss")}
          </a>
        </div>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <TagFilter tags={getTags(posts)} />
      </BlurFade>

      <PostBrowser
        posts={posts.map(toSummary)}
        featured
        delay={BLUR_FADE_DELAY * 3}
      />
    </section>
  );
}
