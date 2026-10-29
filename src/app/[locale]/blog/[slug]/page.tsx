import { ArrowLeft, ArrowRight, Clock, Globe } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeCopy } from "@/components/blog/code-copy";
import { MermaidDiagrams } from "@/components/blog/mermaid-diagrams";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ShareButtons } from "@/components/blog/share-buttons";
import {
  MobileTableOfContents,
  TableOfContents,
} from "@/components/blog/table-of-contents";
import BlurFade from "@/components/magicui/blur-fade";
import { Avatar } from "@/components/ui/avatar";
import { getBlogPosts, getPost, type Post } from "@/data/blog";
import { DATA } from "@/data/resume";
import { Link } from "@/i18n/navigation";
import { LOCALE_TAGS, type Locale, routing } from "@/i18n/routing";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import {
  absoluteUrl,
  feedAlternate,
  languageAlternates,
  localizedPath,
  ogImageUrl,
  SITE_URL,
} from "@/lib/seo";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ locale: string; slug: string }>;

async function resolve(params: Params) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  const post = await getPost(slug, locale);
  return post ? { locale, post } : null;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return routing.locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, post } = resolved;

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  const ogImage = image ? absoluteUrl(image) : ogImageUrl(title);
  const path = `/blog/${post.slug}`;
  // A fallback page duplicates the English one, so point search engines there.
  const canonical = localizedPath(path, post.contentLocale);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(path, post.availableLocales),
      types: feedAlternate(locale),
    },
    authors: [{ name: DATA.name, url: SITE_URL }],
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      authors: [DATA.name],
      siteName: DATA.name,
      locale: LOCALE_TAGS[locale].og,
      url: absoluteUrl(localizedPath(path, locale)),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function structuredData(
  post: Post,
  locale: Locale,
  url: string,
  labels: { home: string; blog: string },
) {
  const image = post.metadata.image
    ? absoluteUrl(post.metadata.image)
    : ogImageUrl(post.metadata.title);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        headline: post.metadata.title,
        datePublished: post.metadata.publishedAt,
        dateModified: post.metadata.publishedAt,
        description: post.metadata.summary,
        keywords: post.metadata.tags,
        image,
        url,
        inLanguage: LOCALE_TAGS[post.contentLocale].lang,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: DATA.name,
          url: SITE_URL,
        },
        publisher: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: DATA.name,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: labels.home,
            item: absoluteUrl(localizedPath("/", locale)),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: labels.blog,
            item: absoluteUrl(localizedPath("/blog", locale)),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.metadata.title,
            item: url,
          },
        ],
      },
    ],
  };
}

function AdjacentPost({
  post,
  label,
  direction,
}: {
  post: Post;
  label: string;
  direction: "prev" | "next";
}) {
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group bg-card/60 hover:border-foreground/30 flex flex-col gap-1 rounded-xl border p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        direction === "next" ? "items-end text-right sm:col-start-2" : ""
      }`}
    >
      <span className="text-muted-foreground flex items-center gap-1 text-xs">
        {direction === "prev" && (
          <Icon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        )}
        {label}
        {direction === "next" && (
          <Icon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="line-clamp-2 text-sm font-medium tracking-tight">
        {post.metadata.title}
      </span>
    </Link>
  );
}

export default async function BlogPost({ params }: { params: Params }) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { locale, post } = resolved;
  setRequestLocale(locale);

  const t = await getTranslations("Blog");
  const tNav = await getTranslations("Nav");
  const posts = await getBlogPosts(locale);
  const index = posts.findIndex((p) => p.slug === post.slug);
  // Posts are newest first: "previous" is older, "next" is newer.
  const older = posts[index + 1];
  const newer = index > 0 ? posts[index - 1] : undefined;

  const url = absoluteUrl(localizedPath(`/blog/${post.slug}`, locale));
  const otherLocale = post.availableLocales.find((l) => l !== locale);
  const showToc = post.headings.length >= 2;
  const tocProps = {
    headings: post.headings,
    title: t("onThisPage"),
    backToTop: t("backToTop"),
  };

  return (
    <section id="blog" className="pb-16">
      <ReadingProgress />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined as a script body.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData(post, locale, url, {
              home: tNav("home"),
              blog: tNav("blog"),
            }),
          ),
        }}
      />

      <BlurFade delay={BLUR_FADE_DELAY}>
        <Link
          href="/blog"
          className="group text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {t("backToBlog")}
        </Link>
      </BlurFade>

      <header className="space-y-5">
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <h1 className="font-display text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
            {post.metadata.title}
          </h1>
        </BlurFade>
        {post.metadata.summary && (
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
              {post.metadata.summary}
            </p>
          </BlurFade>
        )}
        {post.metadata.tags && post.metadata.tags.length > 0 && (
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="flex flex-wrap gap-2">
              {post.metadata.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="bg-card/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </BlurFade>
        )}
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-y py-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border">
                <Image
                  src={DATA.avatarUrl}
                  alt={DATA.name}
                  width={36}
                  height={36}
                  className="aspect-square size-full object-cover"
                />
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-medium">{DATA.name}</span>
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <time dateTime={post.metadata.publishedAt}>
                    {formatDate(post.metadata.publishedAt, locale)}
                  </time>
                  <span aria-hidden>·</span>
                  <Clock className="size-3" />
                  {t("minRead", { minutes: post.readingTime })}
                </span>
              </div>
            </div>
            <ShareButtons url={url} title={post.metadata.title} />
          </div>
        </BlurFade>

        {(post.isFallback || otherLocale) && (
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <p className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-sm">
              <Globe className="size-4 shrink-0" />
              {post.isFallback
                ? t("fallbackNotice")
                : t.rich("readIn", {
                    link: (chunks) => (
                      <Link
                        href={`/blog/${post.slug}`}
                        locale={otherLocale}
                        className="text-accentBrand font-medium hover:underline"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
            </p>
          </BlurFade>
        )}
      </header>

      {post.metadata.image && (
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <div className="bg-muted relative mt-8 aspect-[1200/630] overflow-hidden rounded-xl border">
            <Image
              src={post.metadata.image}
              alt={post.metadata.imageAlt ?? ""}
              fill
              priority
              sizes="(min-width: 768px) 720px, 100vw"
              className="object-cover"
            />
          </div>
        </BlurFade>
      )}

      <div className="relative mt-10">
        {showToc && (
          <>
            <div className="mb-8">
              <MobileTableOfContents {...tocProps} />
            </div>
            <aside className="absolute top-0 left-full hidden h-full pl-12 xl:block">
              <div className="sticky top-24 w-56">
                <TableOfContents {...tocProps} />
              </div>
            </aside>
          </>
        )}

        <article
          id="post-body"
          lang={post.contentLocale}
          className="prose prose-neutral dark:prose-invert prose-headings:scroll-mt-24 prose-img:rounded-xl prose-headings:font-display prose-a:text-accentBrand prose-headings:tracking-tight prose-a:underline-offset-4 max-w-none"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: post body is pre-rendered trusted MDX.
          dangerouslySetInnerHTML={{ __html: post.source }}
        />
        <CodeCopy
          containerId="post-body"
          label={t("copyCode")}
          copiedLabel={t("copied")}
        />
        <MermaidDiagrams containerId="post-body" />
      </div>

      <footer className="mt-16 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-8">
          <p className="text-sm font-medium">{t("share")}</p>
          <ShareButtons url={url} title={post.metadata.title} />
        </div>
        {(older || newer) && (
          <nav className="grid gap-3 sm:grid-cols-2">
            {older && (
              <AdjacentPost
                post={older}
                label={t("previous")}
                direction="prev"
              />
            )}
            {newer && (
              <AdjacentPost post={newer} label={t("next")} direction="next" />
            )}
          </nav>
        )}
      </footer>
    </section>
  );
}
