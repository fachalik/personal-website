"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { PostList } from "@/components/blog/post-list";
import BlurFade from "@/components/magicui/blur-fade";
import type { PostSummary } from "@/data/blog";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Even, so the two-column grid never ends on a lone card.
const PAGE_SIZE = 6;

function matches(post: PostSummary, terms: string[]) {
  const { title, summary, tags = [] } = post.metadata;
  const haystack = [title, summary, ...tags].join(" ").toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Mirrors `q` and `page` into the URL so a filtered view can be shared. */
function syncUrl(query: string, page: number) {
  const url = new URL(window.location.href);
  if (query) url.searchParams.set("q", query);
  else url.searchParams.delete("q");
  if (page > 1) url.searchParams.set("page", String(page));
  else url.searchParams.delete("page");
  window.history.replaceState(window.history.state, "", url);
}

/** Search box + paginated list. Featured card only on the unfiltered first page. */
export function PostBrowser({
  posts,
  featured = false,
  delay = BLUR_FADE_DELAY * 2,
}: {
  posts: PostSummary[];
  featured?: boolean;
  delay?: number;
}) {
  const t = useTranslations("Blog");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  // The page is statically rendered, so read the initial state after hydration.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    setPage(Math.max(1, Number(params.get("page")) || 1));
  }, []);

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    return terms.length ? posts.filter((p) => matches(p, terms)) : posts;
  }, [posts, trimmed]);

  // The full-width featured card rides on top of page 1's regular grid.
  const lead = featured && !trimmed ? 1 : 0;
  const totalPages = Math.max(
    1,
    Math.ceil((filtered.length - lead) / PAGE_SIZE),
  );
  const current = Math.min(page, totalPages);
  const start = current === 1 ? 0 : lead + (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, lead + current * PAGE_SIZE);

  function search(value: string) {
    setQuery(value);
    setPage(1);
    syncUrl(value.trim(), 1);
  }

  function goTo(next: number) {
    setPage(next);
    syncUrl(trimmed, next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <BlurFade delay={delay}>
        <div ref={topRef} className="scroll-mt-24 space-y-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => search(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && search("")}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              className="bg-card/60 placeholder:text-muted-foreground focus-visible:border-foreground/40 h-10 w-full rounded-lg border pr-9 pl-9 text-sm backdrop-blur-sm transition-colors focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => search("")}
                aria-label={t("clearSearch")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <p aria-live="polite" className="text-muted-foreground text-xs">
            {trimmed &&
              t("searchResults", { count: filtered.length, query: trimmed })}
          </p>
        </div>
      </BlurFade>

      {visible.length > 0 ? (
        <PostList
          // Remount on change so each page/result set fades in fresh.
          key={`${trimmed}:${current}`}
          posts={visible}
          featured={lead === 1 && current === 1}
          delay={delay + BLUR_FADE_DELAY}
        />
      ) : (
        <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
          {t("noResults")}{" "}
          <button
            type="button"
            onClick={() => search("")}
            className="text-foreground underline underline-offset-4"
          >
            {t("clearSearch")}
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={current} totalPages={totalPages} onChange={goTo} />
      )}
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const t = useTranslations("Blog");
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const button =
    "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border px-2 text-xs transition-colors disabled:pointer-events-none disabled:opacity-40";
  const idle =
    "bg-card/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground";

  return (
    <nav
      aria-label={t("pagination")}
      className="flex items-center justify-between gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={cn(button, idle)}
      >
        <ChevronLeft className="size-3.5" />
        {t("previous")}
      </button>
      <div className="flex gap-1">
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={t("goToPage", { page: n })}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              button,
              n === page
                ? "border-foreground bg-foreground text-background"
                : idle,
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={cn(button, idle)}
      >
        {t("next")}
        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}
