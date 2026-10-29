# fachalik.my.id

Personal website and blog of FA Chalik, live at [www.fachalik.my.id](https://www.fachalik.my.id/).

Built with Next.js 16, React 19, TypeScript, Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/) and [Magic UI](https://magicui.design/). Based on [dillionverma/portfolio](https://github.com/dillionverma/portfolio).

## Features

- **Single config file**: profile, work history, skills, projects and links all live in [src/data/resume.tsx](./src/data/resume.tsx).
- **Bilingual**: English and Indonesian via [next-intl](https://next-intl.dev/). English stays at `/`, Indonesian lives under `/id`.
- **Blog**: Markdown posts in [content/](./content), with syntax highlighting (Shiki), Mermaid diagrams, a table of contents, reading progress and share buttons.
- **GitHub activity**: one heatmap merging the contribution calendars of several GitHub accounts.
- **SEO**: generated OG images, sitemap, robots, RSS feed (`/feed.xml`), `llms.txt` and structured data.
- Light and dark mode, responsive layout.

## Requirements

- Node.js 24 (`>=24.22.1 <25`)
- pnpm 10 (`>=10.34.7`). npm and yarn are blocked by `engines`.

## Getting started

```bash
git clone https://github.com/fachalik/personal-website.git
cd personal-website
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

`pnpm install` also installs the git hooks through [Lefthook](https://lefthook.dev/).

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm check` | Lint + format with Biome, writing fixes |
| `pnpm typecheck` | Generate route types and run `tsc` |
| `pnpm check:unused` | Find unused files, exports and dependencies with Knip |
| `pnpm blog:cover <slug> ["Label"]` | Generate `public/blog/<slug>/cover.png` and link it in the post's frontmatter |

## Project structure

```
content/            Blog posts (.mdx), one file per locale
public/blog/<slug>/ Images for each post
scripts/            Maintenance scripts (blog cover generator)
src/
  app/[locale]/     Pages (home, blog, post)
  components/       UI, blog and Magic UI components
  data/             resume.tsx (site config) and blog.ts (post loader)
  i18n/             next-intl routing and request config
  messages/         UI translations (en.json, id.json)
  lib/              SEO, OG images, feed, GitHub API helpers
```

## Writing a blog post

Each post is a pair of files in [content/](./content), named by date and slug:

```
content/2026-10-29-react-to-vue.mdx      English
content/2026-10-29-react-to-vue.id.mdx   Indonesian
```

The date prefix is dropped from the URL, so the post above is served at `/blog/react-to-vue` and `/id/blog/react-to-vue`.

Frontmatter:

```yaml
---
title: "From React to Vue"
publishedAt: "2026-10-29"
summary: "One or two sentences shown in the post list and meta tags."
image: "/blog/react-to-vue/cover.png" # optional, ideally 1200×630
imageAlt: "Describe the cover"        # optional
tags: ["vue", "react"]                # optional, lowercase
---
```

Fenced ` ```mermaid ` blocks are rendered as diagrams. To generate a cover, run `pnpm blog:cover react-to-vue "React → Vue"`.

## GitHub activity

The GitHub Activity section merges the public contribution calendars of every account in `githubAccounts` in [src/data/resume.tsx](./src/data/resume.tsx), summing contributions day by day.

It works without configuration, since the public contributions page needs no credentials. Setting `GITHUB_TOKEN` to a personal access token (no scopes needed for public data) switches to the GraphQL API, which is faster and fetches every account in one request:

```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here
```

Results are cached for an hour. If GitHub is unreachable, the section is hidden instead of breaking the page.

## Docker

```bash
GITHUB_TOKEN=ghp_your_token_here docker compose up --build
```

The site is served on port 3000. `GITHUB_TOKEN` is optional.

## Git hooks

Managed by Lefthook ([lefthook.yml](./lefthook.yml)):

- **pre-commit**: Biome on staged files, typecheck, Knip
- **commit-msg**: [commitlint](https://commitlint.js.org/) with Conventional Commits, e.g. `docs(blog): add react to vue guide`
- **pre-push**: `biome ci` and a Docker build (skipped if Docker isn't running)

## License

[MIT](./LICENSE). The original template is © Dillion Verma.
