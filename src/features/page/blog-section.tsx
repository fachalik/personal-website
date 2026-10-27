import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const RECENT_COUNT = 3;

export async function BlogSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Blog");
  const posts = (await getBlogPosts(locale)).slice(0, RECENT_COUNT);

  if (posts.length === 0) return null;

  return (
    <section id="blog">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={BLUR_FADE_DELAY * 12}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("recentTitle")}
            </h2>
            <Link
              href="/blog"
              className="group text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-sm transition-colors"
            >
              {t("viewAll")}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </BlurFade>
        <div className="divide-border/60 divide-y">
          {posts.map((post, i) => (
            <BlurFade key={post.slug} delay={BLUR_FADE_DELAY * 12.5 + i * 0.05}>
              <Link
                href={`/blog/${post.slug}`}
                className="group hover:bg-foreground/[0.04] -mx-3 flex items-start justify-between gap-4 rounded-lg px-3 py-3 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <h3 className="font-medium tracking-tight underline-offset-4 group-hover:underline">
                    {post.metadata.title}
                  </h3>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <time dateTime={post.metadata.publishedAt}>
                      {formatDate(post.metadata.publishedAt, locale, "short")}
                    </time>
                    <span aria-hidden>·</span>
                    <span>{t("minRead", { minutes: post.readingTime })}</span>
                  </div>
                </div>
                <ArrowUpRight className="text-muted-foreground mt-1 size-4 shrink-0 opacity-0 transition-all group-hover:opacity-100" />
              </Link>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
