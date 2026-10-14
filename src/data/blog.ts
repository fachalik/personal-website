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
  image?: string;
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

/** `hello-world.mdx` is English; `hello-world.id.mdx` is its Indonesian version. */
function postFile(slug: string, locale: Locale) {
  const suffix = locale === routing.defaultLocale ? "" : `.${locale}`;
  return path.join(CONTENT_DIR, `${slug}${suffix}.mdx`);
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
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["anchor"], ariaHidden: true, tabIndex: -1 },
      content: { type: "text", value: "#" },
    })
    .use(rehypeCollectHeadings(headings))
    .use(rehypePrettyCode, {
      // https://rehype-pretty.pages.dev/#usage
      theme: {
        light: "min-light",
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
    const availableLocales = routing.locales.filter((l) =>
      fs.existsSync(postFile(slug, l)),
    );

    // Requested translation first, then English. Unknown slug → 404, not a 500.
    const contentLocale = availableLocales.includes(locale)
      ? locale
      : availableLocales.includes(routing.defaultLocale)
        ? routing.defaultLocale
        : null;
    if (!contentLocale) return null;

    const source = fs.readFileSync(postFile(slug, contentLocale), "utf-8");
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
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => path.extname(file) === ".mdx")
    .map((file) => path.basename(file, ".mdx"))
    .filter((name) => !routing.locales.some((l) => name.endsWith(`.${l}`)));
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
