import { ArrowUpRight, Globe } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts, type Post } from "@/data/blog";
import { Link } from "@/i18n/navigation";
import { LOCALE_TAGS, routing } from "@/i18n/routing";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import {
  absoluteUrl,
  languageAlternates,
  localizedPath,
  ogImageUrl,
} from "@/lib/seo";
import { formatDate } from "@/lib/utils";

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

function PostMeta({ post }: { post: Post }) {
  const t = useTranslations("Blog");
  const locale = useLocale();

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-xs">
      <time dateTime={post.metadata.publishedAt}>
        {formatDate(post.metadata.publishedAt, locale, "short")}
      </time>
      <span aria-hidden>·</span>
      <span>{t("minRead", { minutes: post.readingTime })}</span>
      {post.isFallback && (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Globe className="size-3" />
            {t("englishOnly")}
          </span>
        </>
      )}
    </div>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  const t = useTranslations("Blog");

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-xl border bg-card/60 p-6 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-block rounded-md bg-foreground px-2 py-0.5 text-background text-xs">
          {t("latest")}
        </span>
        <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      </div>
      <h2 className="font-bold text-xl tracking-tight sm:text-2xl">
        {post.metadata.title}
      </h2>
      {post.metadata.summary && (
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          {post.metadata.summary}
        </p>
      )}
      <div className="mt-5">
        <PostMeta post={post} />
      </div>
    </Link>
  );
}

function PostRow({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group -mx-3 flex items-start justify-between gap-4 rounded-lg px-3 py-4 transition-colors hover:bg-foreground/[0.04]"
    >
      <div className="min-w-0 space-y-1.5">
        <h3 className="font-medium tracking-tight underline-offset-4 group-hover:underline">
          {post.metadata.title}
        </h3>
        {post.metadata.summary && (
          <p className="line-clamp-2 text-muted-foreground text-sm">
            {post.metadata.summary}
          </p>
        )}
        <PostMeta post={post} />
      </div>
      <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
    </Link>
  );
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
  const [featured, ...rest] = posts;

  const byYear = rest.reduce<Record<string, Post[]>>((acc, post) => {
    const year = post.metadata.publishedAt.slice(0, 4);
    acc[year] ??= [];
    acc[year].push(post);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

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
        </div>
      </BlurFade>

      {featured && (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <FeaturedPost post={featured} />
        </BlurFade>
      )}

      {years.map((year, yi) => (
        <BlurFade key={year} delay={BLUR_FADE_DELAY * 3 + yi * 0.05}>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-muted-foreground text-sm">
                {year}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="divide-y divide-border/60">
              {byYear[year].map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </BlurFade>
      ))}
    </section>
  );
}
