import Link from "next/link";
import BlurFade from "@/components/magicui/blur-fade";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { DATA } from "@/data/resume";
import { BLUR_FADE_DELAY } from "@/lib/constants";

export function ContactSection() {
  return (
    <section id="contact">
      <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
        <BlurFade delay={BLUR_FADE_DELAY * 16}>
          <div className="space-y-3">
            <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
              Contact
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Get in Touch
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Want to chat? Just shoot me a dm{" "}
              <Link
                href={DATA.contact.social.LinkedIn.url}
                className="text-accentBrand hover:underline"
              >
                on LinkedIn
              </Link>{" "}
              and I&apos;ll respond whenever I can. I will ignore all
              soliciting.
            </p>
            <div className="flex justify-center pt-2">
              <ShimmerButton
                href={DATA.contact.social.LinkedIn.url}
                target="_blank"
                background="hsl(var(--accent-brand))"
                className="text-sm transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                Say hello on LinkedIn
              </ShimmerButton>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
