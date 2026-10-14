import { ArrowLeft, NotebookIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatusPage } from "@/components/status-page";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <StatusPage
      code="404"
      title={t("title")}
      description={t("description")}
      actions={
        <>
          <Link
            href="/"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <ArrowLeft className="size-4" />
            {t("home")}
          </Link>
          <Link
            href="/blog"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2",
            )}
          >
            <NotebookIcon className="size-4" />
            {t("blog")}
          </Link>
        </>
      }
    />
  );
}
