"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

/**
 * Muted looping demo that only downloads and plays while on screen, so it
 * doesn't compete with above-the-fold content for bandwidth.
 */
function DemoVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={src.replace(/\.mp4$/, ".webp")}
      loop
      muted
      playsInline
      preload="none"
      className="pointer-events-none mx-auto h-40 w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105" // needed because random black line at bottom of video
    >
      {/* Silent demo; captions describe what's on screen. */}
      <track
        kind="captions"
        src={src.replace(/\.mp4$/, ".vtt")}
        srcLang="en"
        label="English"
      />
    </video>
  );
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  link,
  image,
  video,
  links,
  className,
}: Props) {
  return (
    <div className="h-full transition-transform duration-200 ease-out hover:-translate-y-1">
      <Card
        className={
          "flex h-full flex-col overflow-hidden border transition-all duration-300 ease-out hover:shadow-lg"
        }
      >
        <Link
          target={href ? "_blank" : undefined}
          href={href || "#"}
          aria-label={title}
          className={cn(
            "group block cursor-pointer overflow-hidden",
            className,
          )}
        >
          {video && <DemoVideo src={video} />}
          {image && (
            <Image
              src={image}
              alt={title}
              width={500}
              height={300}
              className="h-40 w-full overflow-hidden object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105"
            />
          )}
        </Link>
        <CardHeader className="px-2">
          <div className="space-y-1">
            <CardTitle className="mt-1 text-base">{title}</CardTitle>
            <time className="font-sans text-xs">{dates}</time>
            <div className="hidden font-sans text-xs underline print:visible">
              {link
                ?.replace("https://", "")
                .replace("www.", "")
                .replace("/", "")}
            </div>
            <Markdown className="prose dark:prose-invert max-w-full text-pretty font-sans text-muted-foreground text-xs">
              {description}
            </Markdown>
          </div>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col px-2">
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags?.map((tag) => (
                <Badge
                  className="px-1 py-0 text-[10px]"
                  variant="secondary"
                  key={tag}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="px-2 pb-2">
          {links && links.length > 0 && (
            <div className="flex flex-row flex-wrap items-start gap-1">
              {links?.map((link) => (
                <Link href={link.href} key={link.href} target="_blank">
                  <Badge className="flex gap-2 px-2 py-1 text-[10px]">
                    {link.icon}
                    {link.type}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
