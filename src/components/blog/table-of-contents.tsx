"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { Heading } from "@/data/blog";
import { cn } from "@/lib/utils";

type Props = {
  headings: Heading[];
  title: string;
  backToTop: string;
};

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // The active heading is the last one that has scrolled past the top third.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -66% 0px" },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function TocList({
  headings,
  active,
}: {
  headings: Heading[];
  active: string | null;
}) {
  return (
    <ul className="space-y-1 border-l text-sm">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={cn(
              "-ml-px block border-transparent border-l-2 py-1 text-muted-foreground transition-colors hover:text-foreground",
              h.level === 3 ? "pl-6" : "pl-3",
              active === h.id && "border-accentBrand text-foreground",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Sticky sidebar on wide screens. */
export function TableOfContents({ headings, title, backToTop }: Props) {
  const active = useActiveHeading(headings.map((h) => h.id));

  return (
    <nav aria-label={title} className="space-y-3">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
        {title}
      </p>
      <TocList headings={headings} active={active} />
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex items-center gap-1.5 pt-2 text-muted-foreground text-xs transition-colors hover:text-foreground"
      >
        <ArrowUp className="size-3.5" />
        {backToTop}
      </button>
    </nav>
  );
}

/** Collapsible version for narrow screens. */
export function MobileTableOfContents({ headings, title }: Props) {
  const active = useActiveHeading(headings.map((h) => h.id));

  return (
    <details className="group rounded-lg border bg-card/60 px-4 py-3 backdrop-blur-sm xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-sm">
        {title}
        <span className="text-muted-foreground transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="mt-3">
        <TocList headings={headings} active={active} />
      </div>
    </details>
  );
}
