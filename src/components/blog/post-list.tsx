import { ArrowUpRight, Globe } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import type { PostSummary as Post } from "@/data/blog";
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

/** Cover image, or a quiet placeholder built from the first tag. */
function Cover({
  post,
  sizes,
  priority = false,
}: {
  post: Post;
  sizes: string;
  priority?: boolean;
}) {
  const { image, tags } = post.metadata;

  return (
    <div className="relative aspect-[1200/630] overflow-hidden border-b bg-muted">
      {image ? (
        <Image
          src={image}
          // Decorative: the title sits right below it.
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(hsl(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:14px_14px]">
          {tags?.[0] && (
            <span className="rounded-md bg-background/80 px-2.5 py-1 font-mono text-muted-foreground text-xs backdrop-blur-sm">
              #{tags[0]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  featured = false,
}: {
  post: Post;
  featured?: boolean;
}) {
  const t = useTranslations("Blog");

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-lg"
    >
      <Cover
        post={post}
        priority={featured}
        sizes={
          featured
            ? "(min-width: 768px) 720px, 100vw"
            : "(min-width: 768px) 360px, (min-width: 640px) 50vw, 100vw"
        }
      />
      <div className={cn("flex flex-1 flex-col p-4", featured && "sm:p-6")}>
        {featured && (
          <span className="mb-3 self-start rounded-md bg-foreground px-2 py-0.5 text-background text-xs">
            {t("latest")}
          </span>
        )}
        <h2
          className={cn(
            "font-semibold tracking-tight underline-offset-4 group-hover:underline",
            featured ? "text-xl sm:text-2xl" : "line-clamp-2",
          )}
        >
          {post.metadata.title}
        </h2>
        {post.metadata.summary && (
          <p
            className={cn(
              "mt-2 text-muted-foreground text-sm leading-relaxed",
              featured ? "line-clamp-3" : "line-clamp-2",
            )}
          >
            {post.metadata.summary}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <PostMeta post={post} />
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
        </div>
      </div>
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

/** Card grid; with `featured`, the first post spans the full width. */
export function PostList({
  posts,
  featured = false,
  delay = BLUR_FADE_DELAY * 2,
}: {
  posts: Post[];
  featured?: boolean;
  delay?: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post, i) => {
        const isFeatured = featured && i === 0;
        return (
          <BlurFade
            key={post.slug}
            delay={delay + i * 0.05}
            className={cn("h-full", isFeatured && "sm:col-span-2")}
          >
            <PostCard post={post} featured={isFeatured} />
          </BlurFade>
        );
      })}
    </div>
  );
}
