"use client";

import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  /** One bullet per line. */
  description?: string;
  defaultExpanded?: boolean;
}
export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
  defaultExpanded = false,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const bullets = description?.split("\n").filter(Boolean) ?? [];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (description) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Link
      href={href || "#"}
      className="block cursor-pointer"
      onClick={handleClick}
    >
      <Card className="flex bg-transparent transition-[background-color,transform] duration-200 ease-out hover:scale-[1.01] hover:bg-accent/40">
        <div className="flex-none">
          <Avatar className="m-auto size-12 border bg-muted-background dark:bg-foreground">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={altText}
                width={48}
                height={48}
                className="aspect-square size-full object-contain"
              />
            ) : (
              <AvatarFallback>{altText[0]}</AvatarFallback>
            )}
          </Avatar>
        </div>
        <div className="group ml-4 flex-grow flex-col items-center">
          <CardHeader>
            <div className="flex flex-col gap-x-2 gap-y-0.5 text-base sm:flex-row sm:items-center sm:justify-between">
              <h3 className="inline-flex items-center justify-start font-semibold text-xs leading-none sm:text-sm">
                {title}
                {badges && (
                  <span className="inline-flex gap-x-1">
                    {badges.map((badge) => (
                      <div key={`badge-${badge}`}>
                        <Badge
                          variant="secondary"
                          className="align-middle text-xs"
                        >
                          {badge}
                        </Badge>
                      </div>
                    ))}
                  </span>
                )}
                <ChevronRightIcon
                  className={cn(
                    "size-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100",
                    isExpanded ? "rotate-90" : "rotate-0",
                  )}
                />
              </h3>
              <div className="shrink-0 whitespace-nowrap text-muted-foreground text-xs tabular-nums sm:text-right sm:text-sm">
                {period}
              </div>
            </div>
            {subtitle && <div className="font-sans text-xs">{subtitle}</div>}
          </CardHeader>
          {description && (
            // 0fr → 1fr rows animates to the content's natural height.
            <div
              className={cn(
                "mt-2 grid text-xs transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-sm",
                isExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                {bullets.length > 1 ? (
                  <ul className="list-disc space-y-1 pl-4">
                    {bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : (
                  description
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
