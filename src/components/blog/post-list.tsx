import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { PostSummary as Post } from "@/data/blog";
import { Link } from "@/i18n/navigation";
import { cn, formatDate } from "@/lib/utils";

function PostMeta({ post }: { post: Post }) {
  const t = useTranslations("Blog");
  const locale = useLocale();

  return (
    <p className="text-muted-foreground text-sm">
      <time dateTime={post.metadata.publishedAt}>
        {formatDate(post.metadata.publishedAt, locale, "short")}
      </time>
      {", "}
      {t("minRead", { minutes: post.readingTime })}
      {post.isFallback && `, ${t("englishOnly")}`}
    </p>
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
    <div className="bg-muted relative aspect-[1200/630] overflow-hidden rounded-xl border">
      {image ? (
        <Image
          src={image}
          // Decorative: the title sits right beside it.
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.02]"
        />
      ) : (
        tags?.[0] && (
          <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            #{tags[0]}
          </span>
        )
      )}
    </div>
  );
}

const CARD_LINK =
  "group focus-visible:outline-accentBrand rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4";
const TITLE_HOVER =
  "font-display decoration-accentBrand font-bold text-balance underline-offset-4 group-hover:underline";

/** The newest post: a large cover beside its title. */
function LeadPost({ post }: { post: Post }) {
  const t = useTranslations("Blog");
  const { title, description, summary } = post.metadata;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        CARD_LINK,
        "grid items-center gap-6 md:grid-cols-[7fr_5fr] md:gap-10",
      )}
    >
      <Cover post={post} priority sizes="(min-width: 768px) 60vw, 100vw" />
      <div className="space-y-3">
        <p className="text-accentBrand text-sm font-semibold">{t("latest")}</p>
        <h2 className={cn(TITLE_HOVER, "text-3xl leading-tight lg:text-4xl")}>
          {title}
        </h2>
        <p className="text-muted-foreground text-base/relaxed text-pretty">
          {description ?? summary}
        </p>
        <PostMeta post={post} />
      </div>
    </Link>
  );
}

function PostCard({ post, Heading }: { post: Post; Heading: "h2" | "h3" }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(CARD_LINK, "flex flex-col gap-3")}
    >
      <Cover
        post={post}
        sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
      />
      <Heading className={cn(TITLE_HOVER, "text-xl leading-snug")}>
        {post.metadata.title}
      </Heading>
      <PostMeta post={post} />
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
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors";
  const idle =
    "text-muted-foreground hover:border-foreground/30 hover:text-foreground";
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
          {tag}
          <span className="text-xs tabular-nums opacity-70">{count}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Card grid; with `lead`, the first post sits large above it. */
export function PostList({
  posts,
  lead = false,
  heading = "h2",
}: {
  posts: Post[];
  lead?: boolean;
  heading?: "h2" | "h3";
}) {
  const [first, ...rest] = posts;
  const cards = lead ? rest : posts;

  return (
    <div className="space-y-12">
      {lead && first && <LeadPost post={first} />}
      {cards.length > 0 && (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((post) => (
            <PostCard key={post.slug} post={post} Heading={heading} />
          ))}
        </div>
      )}
    </div>
  );
}
