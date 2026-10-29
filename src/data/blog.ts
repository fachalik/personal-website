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
import { cache } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { type Locale, routing } from "@/i18n/routing";

const CONTENT_DIR = path.join(process.cwd(), "content");

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  /** Cover, ideally 1200×630, e.g. `/blog/<slug>/cover.webp` in `public/`. */
  image?: string;
  /** Describes the cover on the post page; omit if it's purely decorative. */
  imageAlt?: string;
  /** Lowercase, URL-safe topics, e.g. `["go", "typescript"]`. */
  tags?: string[];
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

/**
 * Turns ```mermaid blocks into empty placeholders before rehype-pretty-code
 * sees them; `MermaidDiagrams` renders them in the browser so they follow the theme.
 */
function rehypeMermaid() {
  return (tree: Root) => {
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
      return {
        type: "element",
        tagName: "div",
        properties: {
          className: ["mermaid-diagram"],
          dataMermaid: hastToString(code),
        },
        children: [],
      } satisfies Element;
    });
  };
}

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
    .use(rehypeMermaid)
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
      ],
    })
    .use(rehypeStringify)
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

/** Every tag used by these posts with its post count, most used first. */
export function getTags(posts: PostSummary[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.metadata.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
