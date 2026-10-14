import { useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";

export function ContactSection() {
  const t = useTranslations("Contact");
  return (
    <section id="contact">
      <div className="grid w-full items-center justify-center gap-4 px-4 py-12 text-center md:px-6">
        <BlurFade delay={BLUR_FADE_DELAY * 16}>
          <div className="space-y-3">
            <div className="inline-block rounded-lg bg-foreground px-3 py-1 text-background text-sm">
              {t("badge")}
            </div>
            <h2 className="font-bold text-3xl tracking-tighter sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t.rich("description", {
                link: (chunks) => (
                  <a
                    href={DATA.contact.social.LinkedIn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accentBrand hover:underline"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
            <div className="flex justify-center pt-2">
              <ShimmerButton
                href={DATA.contact.social.LinkedIn.url}
                target="_blank"
                background="hsl(var(--accent-brand))"
                className="text-sm transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                {t("cta")}
              </ShimmerButton>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
