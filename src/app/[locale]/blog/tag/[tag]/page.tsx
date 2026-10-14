import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PostList, TagFilter } from "@/components/blog/post-list";
import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts, getTags } from "@/data/blog";
import { Link } from "@/i18n/navigation";
import { LOCALE_TAGS, routing } from "@/i18n/routing";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import {
  absoluteUrl,
  feedAlternate,
  languageAlternates,
  localizedPath,
  ogImageUrl,
} from "@/lib/seo";

type Params = Promise<{ locale: string; tag: string }>;

// Only tags that exist at build time; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const params = await Promise.all(
    routing.locales.map(async (locale) =>
      getTags(await getBlogPosts(locale)).map(({ tag }) => ({ locale, tag })),
    ),
  );
  return params.flat();
}

async function resolve(params: Params) {
  const { locale, tag } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  const allPosts = await getBlogPosts(locale);
  const posts = allPosts.filter((p) => p.metadata.tags?.includes(tag));
  return posts.length > 0 ? { locale, tag, posts, allPosts } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, tag } = resolved;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const title = t("tagTitle", { tag });
  const description = t("tagDescription", { tag });
  const path = `/blog/tag/${tag}`;

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(path, locale),
      languages: languageAlternates(path),
      types: feedAlternate(locale),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: LOCALE_TAGS[locale].og,
      url: absoluteUrl(localizedPath(path, locale)),
      images: [
        { url: ogImageUrl(title), width: 1200, height: 630, alt: title },
      ],
    },
  };
}

export default async function TagPage({ params }: { params: Params }) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { locale, tag, posts, allPosts } = resolved;
  setRequestLocale(locale);

  const t = await getTranslations("Blog");

  return (
    <section className="space-y-12">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="space-y-3">
          <Link
            href="/blog"
            className="group mb-5 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t("backToBlog")}
          </Link>
          <h1 className="font-bold text-3xl tracking-tighter sm:text-5xl">
            #{tag}
          </h1>
          <p className="text-muted-foreground md:text-lg/relaxed">
            {t("postCount", { count: posts.length })}
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <TagFilter tags={getTags(allPosts)} active={tag} />
      </BlurFade>

      <PostList posts={posts} delay={BLUR_FADE_DELAY * 3} />
    </section>
  );
}
