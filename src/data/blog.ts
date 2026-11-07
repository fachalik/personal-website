import fs from "node:fs";
import path from "node:path";
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import matter from "gray-matter";
import type { Element, Root } from "hast";
import { toString as hastToString } from "hast-util-to-string";
import { parse, render } from "pele";
import { cache } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { ShikiTransformer } from "shiki";
import { unified } from "unified";
import { type Locale, routing } from "@/i18n/routing";

const CONTENT_DIR = path.join(process.cwd(), "content");

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  /** Search and social snippet, 160 characters at most. Falls back to `summary`. */
  description?: string;
  /** Set when a post gets a meaningful revision. */
  updatedAt?: string;
  /** Cover for cards and social previews, ideally 1200×630, in `public/blog/<slug>/`. */
  image?: string;
  /** Lowercase, URL-safe topics, e.g. `["go", "typescript"]`. */
  tags?: string[];
  /** Posts in the same series are suggested to each other first. */
  series?: string;
};

export type Heading = { id: string; text: string; level: 2 | 3 };

export type Post = {
  source: string;
  metadata: Metadata;
  slug: string;
  readingTime: number;
  headings: Heading[];
  /** Language the body is actually written in. */
  contentLocale: Locale;
  /** True when the requested locale had no translation and English was served. */
  isFallback: boolean;
  /** Every locale this post has been written in. */
  availableLocales: Locale[];
};

/** What a post list needs; leaves the rendered HTML on the server. */
export type PostSummary = Pick<
  Post,
  "slug" | "metadata" | "readingTime" | "isFallback"
>;

export function toSummary({
  slug,
  metadata,
  readingTime,
  isFallback,
}: Post): PostSummary {
  return { slug, metadata, readingTime, isFallback };
}

/** Files start with their publish date so they sort oldest → newest on disk. */
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

type PostFile = { file: string; slug: string; locale: Locale };

/**
 * `2026-10-16-hello-world.mdx` is English; `2026-10-16-hello-world.id.mdx` is
 * its Indonesian version. Both have the slug `hello-world`.
 */
function getPostFiles(): PostFile[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => path.extname(file) === ".mdx")
    .map((file) => {
      const name = path.basename(file, ".mdx");
      const locale =
        routing.locales.find(
          (l) => l !== routing.defaultLocale && name.endsWith(`.${l}`),
        ) ?? routing.defaultLocale;
      const base =
        locale === routing.defaultLocale
          ? name
          : name.slice(0, -(locale.length + 1));
      return {
        file: path.join(CONTENT_DIR, file),
        slug: base.replace(DATE_PREFIX, ""),
        locale,
      };
    });
}

/** Inner width of a diagram frame at the full article width. */
const DIAGRAM_MAX_WIDTH = 688;
const DIAGRAM_NARROW_WIDTH = 340;

function diagramFrame(svg: string, className: string): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: [className] },
    children: [{ type: "raw", value: svg }],
  };
}

/**
 * Turns ```mermaid blocks into SVG at build time, before rehype-pretty-code sees
 * them, so diagrams ship no JavaScript. Colors come from `--pele-*` in
 * globals.css, so they follow the theme. A bad diagram fails the build.
 */
function rehypeDiagrams() {
  return (tree: Root) => {
    let count = 0;
    tree.children = tree.children.map((node) => {
      if (node.type !== "element" || node.tagName !== "pre") return node;
      const code = node.children[0];
      if (
        code?.type !== "element" ||
        code.tagName !== "code" ||
        !String(code.properties.className ?? "").includes("language-mermaid")
      ) {
        return node;
      }

      count += 1;
      const model = parse(hastToString(code));
      const fontFamily = "Inter, sans-serif";
      const narrow = render(model, {
        maxWidth: DIAGRAM_NARROW_WIDTH,
        fontFamily,
        idPrefix: `d${count}n-`,
      });
      const wide = render(model, {
        maxWidth: DIAGRAM_MAX_WIDTH,
        autoDirection: false,
        fontFamily,
        idPrefix: `d${count}w-`,
      });

      // A long left-to-right flow ignores maxWidth and would shrink until its
      // labels are unreadable, so it uses the stacked layout everywhere.
      const single =
        wide.width > DIAGRAM_MAX_WIDTH || wide.width <= narrow.width;
      return {
        type: "element",
        tagName: "div",
        properties: { className: ["diagram"] },
        children: single
          ? [diagramFrame(narrow.svg, "diagram-any")]
          : [
              diagramFrame(wide.svg, "diagram-wide"),
              diagramFrame(narrow.svg, "diagram-narrow"),
            ],
      } satisfies Element;
    });
  };
}

/** The themes' comment colors fail WCAG AA on the site's code block backgrounds. */
const COMMENT_COLORS: [RegExp, string][] = [
  [/--shiki-light:#6A737D/i, "--shiki-light:#57606A"],
  [/--shiki-dark:#6B737C/i, "--shiki-dark:#9BA3AB"],
];

const transformerCommentContrast: ShikiTransformer = {
  name: "comment-contrast",
  span(node) {
    const { style } = node.properties;
    if (typeof style !== "string") return;
    node.properties.style = COMMENT_COLORS.reduce(
      (css, [from, to]) => css.replace(from, to),
      style,
    );
  },
};

/** Collects h2/h3 for the table of contents; runs after rehype-slug assigns ids. */
function rehypeCollectHeadings(headings: Heading[]) {
  return () => (tree: Root) => {
    for (const node of tree.children) {
      if (node.type !== "element") continue;
      const el = node as Element;
      if ((el.tagName === "h2" || el.tagName === "h3") && el.properties.id) {
        headings.push({
          id: String(el.properties.id),
          text: hastToString(el),
          level: el.tagName === "h2" ? 2 : 3,
        });
      }
    }
  };
}

export async function markdownToHTML(markdown: string) {
  const headings: Heading[] = [];
  const p = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeDiagrams)
    .use(rehypeSlug)
    // Before autolink, so the "#" anchor text doesn't leak into TOC labels.
    .use(rehypeCollectHeadings(headings))
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["anchor"], ariaHidden: "true", tabIndex: -1 },
      content: { type: "text", value: "#" },
    })
    .use(rehypePrettyCode, {
      // https://rehype-pretty.pages.dev/#usage
      theme: {
        light: "github-light",
        dark: "min-dark",
      },
      keepBackground: false,
      // `// [!code ++]`, `// [!code highlight]`, `// [!code focus]` inside code blocks.
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        transformerCommentContrast,
      ],
    })
    // Only the SVG from rehypeDiagrams is raw; remark-rehype drops HTML in posts.
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return { html: p.toString(), headings };
}

function readingMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export const getPost = cache(
  async (
    slug: string,
    locale: Locale = routing.defaultLocale,
  ): Promise<Post | null> => {
    const files = getPostFiles().filter((f) => f.slug === slug);
    const availableLocales = routing.locales.filter((l) =>
      files.some((f) => f.locale === l),
    );

    // Requested translation first, then English. Unknown slug → 404, not a 500.
    const contentLocale = availableLocales.includes(locale)
      ? locale
      : availableLocales.includes(routing.defaultLocale)
        ? routing.defaultLocale
        : null;
    if (!contentLocale) return null;

    const file = files.find((f) => f.locale === contentLocale);
    if (!file) return null;
    const source = fs.readFileSync(file.file, "utf-8");
    const { content: rawContent, data: metadata } = matter(source);
    const { html, headings } = await markdownToHTML(rawContent);

    return {
      source: html,
      metadata: metadata as Metadata,
      slug,
      readingTime: readingMinutes(rawContent),
      headings,
      contentLocale,
      isFallback: contentLocale !== locale,
      availableLocales,
    };
  },
);

function getSlugs() {
  return getPostFiles()
    .filter((f) => f.locale === routing.defaultLocale)
    .map((f) => f.slug);
}

/** Newest first. */
export async function getBlogPosts(locale: Locale = routing.defaultLocale) {
  const posts = await Promise.all(getSlugs().map((s) => getPost(s, locale)));
  return posts
    .filter((post): post is Post => post !== null)
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime(),
    );
}

/** A tag needs this many posts to get a page; rarer ones still work in search. */
const MIN_POSTS_PER_TAG = 2;

/** Tags that have their own page, with post counts, most used first. */
export function getTags(posts: PostSummary[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.metadata.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts]
    .filter(([, count]) => count >= MIN_POSTS_PER_TAG)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

const RELATED_COUNT = 4;
const SERIES_WEIGHT = 3;

/** Best matches for `post`: same series first, then shared tags, newest on ties. */
export function getRelatedPosts(post: PostSummary, posts: Post[]) {
  const { series, tags = [] } = post.metadata;
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      score:
        (series && candidate.metadata.series === series ? SERIES_WEIGHT : 0) +
        tags.filter((tag) => candidate.metadata.tags?.includes(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RELATED_COUNT)
    .map(({ candidate }) => candidate);
}
