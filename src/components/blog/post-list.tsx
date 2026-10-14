import { ArrowUpRight, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import type { Post } from "@/data/blog";
import { Link } from "@/i18n/navigation";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

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

/** Tag chips; `active` highlights the current one and makes "All" a way out. */
export function TagFilter({
  tags,
  active,
}: {
  tags: { tag: string; count: number }[];
  active?: string;
}) {
  const t = useTranslations("Blog");
  if (tags.length === 0) return null;

  const chip =
    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors";
  const idle =
    "bg-card/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground";
  const current = "border-foreground bg-foreground text-background";

  return (
    <nav aria-label={t("tags")} className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        aria-current={active ? undefined : "page"}
        className={cn(chip, active ? idle : current)}
      >
        {t("allTags")}
      </Link>
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`/blog/tag/${tag}`}
          aria-current={tag === active ? "page" : undefined}
          className={cn(chip, tag === active ? current : idle)}
        >
          #{tag}
          <span className="opacity-60">{count}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Newest post as a card (when `featured`), the rest grouped by year. */
export function PostList({
  posts,
  featured = false,
  delay = BLUR_FADE_DELAY * 2,
}: {
  posts: Post[];
  featured?: boolean;
  delay?: number;
}) {
  const [first, ...others] = posts;
  const rest = featured ? others : posts;

  const byYear = rest.reduce<Record<string, Post[]>>((acc, post) => {
    const year = post.metadata.publishedAt.slice(0, 4);
    acc[year] ??= [];
    acc[year].push(post);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <>
      {featured && first && (
        <BlurFade delay={delay}>
          <FeaturedPost post={first} />
        </BlurFade>
      )}

      {years.map((year, yi) => (
        <BlurFade key={year} delay={delay + BLUR_FADE_DELAY + yi * 0.05}>
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
    </>
  );
}
