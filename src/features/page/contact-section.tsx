import { useTranslations } from "next-intl";
import { CopyEmail } from "@/components/copy-email";
import { Icons } from "@/components/icons";
import BlurFade from "@/components/magicui/blur-fade";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { buttonVariants } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BUTTON_SIZE =
  "h-11 w-full gap-2 rounded-full px-6 font-medium text-sm transition-transform duration-300 hover:scale-[1.03] active:scale-95";

export function ContactSection() {
  const t = useTranslations("Contact");
  return (
    <section id="contact">
      <BlurFade delay={BLUR_FADE_DELAY * 16}>
        <div className="relative overflow-hidden rounded-3xl border bg-background/70 px-6 py-12 text-center shadow-sm backdrop-blur-sm sm:px-12 sm:py-16">
          {/* Soft brand glow behind the heading */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 max-w-md rounded-full bg-accentBrand/20 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 font-medium text-muted-foreground text-xs">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {t("badge")}
            </span>
            <h2 className="text-balance font-bold text-3xl tracking-tighter sm:text-5xl">
              {t("title")}
            </h2>
            <p className="max-w-[480px] text-balance text-muted-foreground md:text-lg/relaxed">
              {t("description")}
            </p>
            <div className="grid w-full max-w-md grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
              <ShimmerButton
                href={`mailto:${DATA.contact.email}`}
                background="hsl(var(--accent-brand))"
                className={cn(BUTTON_SIZE, "py-0 text-accentBrand-foreground")}
              >
                <Icons.email className="size-4" />
                {t("cta")}
              </ShimmerButton>
              <a
                href={DATA.contact.social.LinkedIn.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  BUTTON_SIZE,
                  "bg-transparent",
                )}
              >
                <Icons.linkedin className="size-4" />
                {t("ctaSecondary")}
              </a>
            </div>
            <CopyEmail email={DATA.contact.email} className="mt-1" />
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
