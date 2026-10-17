// Generates a simple 1200×630 cover for a blog post and links it in the
// post's frontmatter (every locale).
//
//   node scripts/blog-cover.mjs <slug> ["Short label"]
//
// Writes public/blog/<slug>/cover.png. The label defaults to the post title;
// pass something short (1–3 words) for a bolder cover.
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import matter from "gray-matter";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("next/og");

// Mirrors src/lib/brand.ts.
const BRAND = { indigo: "#4f46e5", cream: "#faf7f0", ink: "#0a0b0d" };
const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const FONT_DIR = path.join(ROOT, "src", "assets", "fonts");

const [slug, labelArg] = process.argv.slice(2);
if (!slug) {
  console.error('Usage: node scripts/blog-cover.mjs <slug> ["Short label"]');
  process.exit(1);
}

// `2026-10-16-<slug>.mdx` and `2026-10-16-<slug>.id.mdx`.
const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => /\.mdx$/.test(f))
  .filter((f) =>
    f
      .replace(/^\d{4}-\d{2}-\d{2}-/, "")
      .match(new RegExp(`^${slug}(\\.\\w+)?\\.mdx$`)),
  )
  .map((f) => path.join(CONTENT_DIR, f));
const english = files.find((f) => !/\.\w{2}\.mdx$/.test(f));
if (!english) {
  console.error(`No post found for slug "${slug}".`);
  process.exit(1);
}

const { data } = matter(fs.readFileSync(english, "utf-8"));
const label = labelArg ?? data.title;
const tags = (data.tags ?? []).slice(0, 3);

// Tiny hyperscript so the script needs no JSX build step.
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children },
});

const cover = h(
  "div",
  {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "64px 72px",
    background: BRAND.cream,
    fontFamily: "Space Grotesk",
    color: BRAND.ink,
  },
  h(
    "div",
    { alignItems: "center", gap: 20 },
    h(
      "div",
      {
        width: 64,
        height: 64,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        background: BRAND.indigo,
        color: BRAND.cream,
        fontSize: 50,
        fontWeight: 700,
      },
      "F",
    ),
    ...tags.map((tag) =>
      h(
        "div",
        {
          padding: "6px 16px",
          borderRadius: 999,
          border: `2px solid ${BRAND.ink}22`,
          background: BRAND.cream,
          fontSize: 26,
          fontWeight: 500,
          color: `${BRAND.ink}aa`,
        },
        `#${tag}`,
      ),
    ),
  ),
  h(
    "div",
    { flexDirection: "column", gap: 28 },
    h("div", {
      width: 96,
      height: 12,
      borderRadius: 6,
      background: BRAND.indigo,
    }),
    h(
      "div",
      {
        fontSize: label.length > 40 ? 64 : label.length > 18 ? 88 : 128,
        fontWeight: 700,
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        maxWidth: 1000,
      },
      label,
    ),
  ),
);

const font = (file) => fs.readFileSync(path.join(FONT_DIR, file));
const image = new ImageResponse(cover, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Space Grotesk", data: font("SpaceGrotesk-Bold.ttf"), weight: 700 },
    {
      name: "Space Grotesk",
      data: font("SpaceGrotesk-Medium.ttf"),
      weight: 500,
    },
  ],
});

const outDir = path.join(ROOT, "public", "blog", slug);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "cover.png"),
  Buffer.from(await image.arrayBuffer()),
);

// Add or replace `image:` right after `publishedAt:` in every locale's file.
const src = `/blog/${slug}/cover.png`;
for (const file of files) {
  const text = fs.readFileSync(file, "utf-8");
  const next = /^image:.*$/m.test(text)
    ? text.replace(/^image:.*$/m, `image: "${src}"`)
    : text.replace(/^(publishedAt:.*)$/m, `$1\nimage: "${src}"`);
  fs.writeFileSync(file, next);
}

console.log(
  `✓ public${src} → ${files.map((f) => path.basename(f)).join(", ")}`,
);
