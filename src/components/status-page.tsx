import BlurFade from "@/components/magicui/blur-fade";
import { BLUR_FADE_DELAY } from "@/lib/constants";

/** Shared layout for the 404 and error screens; `actions` holds the buttons. */
export function StatusPage({
  code,
  title,
  description,
  actions,
}: {
  code: string;
  title: string;
  description: string;
  actions: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <p
          aria-hidden
          className="select-none font-bold font-display text-7xl text-accentBrand tracking-tighter sm:text-9xl"
        >
          {code}
        </p>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <h1 className="mt-4 text-balance font-bold font-display text-3xl tracking-tighter sm:text-4xl">
          {title}
        </h1>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 3}>
        <p className="mx-auto mt-3 max-w-[480px] text-pretty text-muted-foreground md:text-lg/relaxed">
          {description}
        </p>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 4}>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {actions}
        </div>
      </BlurFade>
    </main>
  );
}
