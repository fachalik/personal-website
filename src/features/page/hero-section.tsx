import { useTranslations } from "next-intl";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";

export function HeroSection() {
  const t = useTranslations("Hero");
  return (
    <section id="hero">
      <div className="mx-auto w-full max-w-2xl space-y-8 md:max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="order-2 flex flex-1 flex-col space-y-1.5 sm:order-1">
            <BlurFadeText
              delay={BLUR_FADE_DELAY}
              className="font-bold font-display text-3xl tracking-tighter sm:text-5xl xl:text-6xl/none"
              yOffset={8}
              text={t("greeting", { name: DATA.name })}
            />
            <BlurFadeText
              className="max-w-[600px] md:text-xl"
              delay={BLUR_FADE_DELAY}
              text={t("description")}
            />
          </div>
          <BlurFade delay={BLUR_FADE_DELAY} className="order-1 sm:order-2">
            <Avatar className="size-20 border sm:size-28">
              <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
              <AvatarFallback>{DATA.initials}</AvatarFallback>
            </Avatar>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
