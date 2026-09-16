import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBlogPosts, getPost } from "@/data/blog";
import { DATA } from "@/data/resume";
import { absoluteUrl, ogImageUrl, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {};
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  const ogImage = image ? absoluteUrl(image) : ogImageUrl(title);
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    authors: [{ name: DATA.name, url: SITE_URL }],
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      authors: [DATA.name],
      siteName: DATA.name,
      locale: "en_US",
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Blog({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = post.metadata.image
    ? absoluteUrl(post.metadata.image)
    : ogImageUrl(post.metadata.title);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        headline: post.metadata.title,
        datePublished: post.metadata.publishedAt,
        dateModified: post.metadata.publishedAt,
        description: post.metadata.summary,
        image,
        url,
        inLanguage: "en-US",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: DATA.name,
          url: SITE_URL,
        },
        publisher: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: DATA.name,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: absoluteUrl("/blog"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.metadata.title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <section id="blog">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined as a script body.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <Suspense fallback={<p className="h-5" />}>
          <time
            className="text-sm text-neutral-600 dark:text-neutral-400"
            dateTime={post.metadata.publishedAt}
          >
            {formatDate(post.metadata.publishedAt)}
          </time>
        </Suspense>
      </div>
      <article
        className="prose dark:prose-invert"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: post body is pre-rendered trusted MDX.
        dangerouslySetInnerHTML={{ __html: post.source }}
      />
    </section>
  );
}
