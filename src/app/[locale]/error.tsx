"use client";

import { ArrowLeft, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { StatusPage } from "@/components/status-page";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      title={t("title")}
      description={t("description")}
      actions={
        <>
          <Button size="sm" className="gap-2" onClick={() => retry()}>
            <RotateCw className="size-4" />
            {t("retry")}
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2",
            )}
          >
            <ArrowLeft className="size-4" />
            {t("home")}
          </Link>
        </>
      }
    />
  );
}
