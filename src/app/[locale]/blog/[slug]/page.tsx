import { ArrowLeft, Globe } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeCopy } from "@/components/blog/code-copy";
import { PostList } from "@/components/blog/post-list";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ShareButtons } from "@/components/blog/share-buttons";
import {
  MobileTableOfContents,
  TableOfContents,
} from "@/components/blog/table-of-contents";
import { Avatar } from "@/components/ui/avatar";
import {
  getBlogPosts,
  getPost,
  getRelatedPosts,
  getTags,
  type Post,
  toSummary,
} from "@/data/blog";
import { DATA } from "@/data/resume";
import { Link } from "@/i18n/navigation";
import { LOCALE_TAGS, type Locale, routing } from "@/i18n/routing";
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
    updatedAt: modifiedTime,
    summary,
    image,
  } = post.metadata;
  const description = post.metadata.description ?? summary;
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
      modifiedTime,
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
        dateModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
        description: post.metadata.description ?? post.metadata.summary,
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

export default async function BlogPost({ params }: { params: Params }) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { locale, post } = resolved;
  setRequestLocale(locale);

  const t = await getTranslations("Blog");
  const tNav = await getTranslations("Nav");
  const posts = await getBlogPosts(locale);
  const [nextUp, ...related] = getRelatedPosts(post, posts);
  const tagsWithPages = new Set(getTags(posts).map(({ tag }) => tag));
  const tags = post.metadata.tags?.filter((tag) => tagsWithPages.has(tag));

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

      <header className="flex flex-col items-center gap-4 text-center">
        <Link
          href="/blog"
          className="group text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {t("backToBlog")}
        </Link>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm font-semibold">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="text-accentBrand underline-offset-4 hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-tighter text-balance sm:text-5xl">
          {post.metadata.title}
        </h1>
        {post.metadata.summary && (
          <p className="text-muted-foreground max-w-2xl text-lg/relaxed text-pretty">
            {post.metadata.summary}
          </p>
        )}
        <div className="flex items-center gap-3 text-left text-sm">
          <Avatar className="size-9 border">
            <Image
              src={DATA.avatarUrl}
              alt=""
              width={36}
              height={36}
              className="aspect-square size-full object-cover"
            />
          </Avatar>
          <div>
            <p className="font-medium">{DATA.name}</p>
            <p className="text-muted-foreground text-xs">
              <time dateTime={post.metadata.publishedAt}>
                {formatDate(post.metadata.publishedAt, locale)}
              </time>
              {", "}
              {t("minRead", { minutes: post.readingTime })}
              {post.metadata.updatedAt && (
                <>
                  {", "}
                  <time dateTime={post.metadata.updatedAt}>
                    {t("updated", {
                      date: formatDate(post.metadata.updatedAt, locale),
                    })}
                  </time>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {(post.isFallback || otherLocale) && (
            <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
              <Globe className="size-3.5 shrink-0" />
              <span>
                {post.isFallback
                  ? t("fallbackNotice")
                  : t.rich("readIn", {
                      link: (chunks) => (
                        <Link
                          href={`/blog/${post.slug}`}
                          locale={otherLocale}
                          className="text-accentBrand font-medium underline-offset-4 hover:underline"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
              </span>
            </p>
          )}
          <ShareButtons url={url} title={post.metadata.title} />
        </div>
      </header>

      {post.metadata.image && (
        <div className="blog-wide mt-10 [--blog-half:31.25rem]">
          <div className="bg-muted relative aspect-[1200/630] overflow-hidden rounded-2xl border">
            <Image
              src={post.metadata.image}
              // Decorative: it repeats the title above it.
              alt=""
              fill
              priority
              sizes="(min-width: 1048px) 1000px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="relative mt-12">
        {showToc && (
          <>
            <div className="mx-auto mb-8 max-w-[42.5rem]">
              <MobileTableOfContents {...tocProps} />
            </div>
            <aside className="absolute top-0 left-full hidden h-full pl-8 xl:block">
              <div className="sticky top-24 w-56">
                <TableOfContents {...tocProps} />
              </div>
            </aside>
          </>
        )}

        <article
          id="post-body"
          lang={post.contentLocale}
          className="prose prose-neutral dark:prose-invert sm:prose-lg prose-headings:scroll-mt-24 prose-headings:font-display prose-headings:tracking-tight prose-a:text-accentBrand prose-a:underline-offset-4 prose-img:rounded-lg mx-auto max-w-[42.5rem]"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: post body is pre-rendered trusted MDX.
          dangerouslySetInnerHTML={{ __html: post.source }}
        />
        <CodeCopy
          containerId="post-body"
          label={t("copyCode")}
          copiedLabel={t("copied")}
        />
      </div>

      <footer className="mt-16 space-y-12">
        <div className="mx-auto max-w-[42.5rem] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium">{t("share")}</p>
            <ShareButtons url={url} title={post.metadata.title} />
          </div>
          {nextUp && (
            <Link
              href={`/blog/${nextUp.slug}`}
              className="group bg-accentBrand/10 focus-visible:outline-accentBrand block rounded-xl p-5 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <p className="text-accentBrand text-sm font-semibold">
                {t("nextUp")}
              </p>
              <p className="font-display decoration-accentBrand mt-1 text-xl leading-snug font-bold underline-offset-4 group-hover:underline">
                {nextUp.metadata.title}
              </p>
            </Link>
          )}
          <div className="bg-card flex items-start gap-4 rounded-xl border p-5">
            <Avatar className="size-12 shrink-0 border">
              <Image
                src={DATA.avatarUrl}
                alt=""
                width={48}
                height={48}
                className="aspect-square size-full object-cover"
              />
            </Avatar>
            <div className="min-w-0 space-y-1 text-sm">
              <p className="font-medium">{DATA.name}</p>
              <p className="text-muted-foreground text-pretty">
                {t("authorBio")}
              </p>
              {DATA.openToWork && (
                <Link
                  href="/#contact"
                  className="text-accentBrand inline-block pt-1 font-medium underline-offset-4 hover:underline"
                >
                  {t("hireCta")}
                </Link>
              )}
            </div>
          </div>
        </div>
        {related.length > 0 && (
          <div className="blog-wide space-y-5">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {t("related")}
            </h2>
            <PostList posts={related.map(toSummary)} heading="h3" />
          </div>
        )}
      </footer>
    </section>
  );
}
