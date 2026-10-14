import { cn } from "@/lib/utils";

type PaperVariant = "genkoyoshi" | "grid" | "dots" | "plain";

interface PaperTextureProps {
  /**
   * genkoyoshi — kanji-practice cells (square + dashed cross), the default
   * grid     — plain notebook squares
   * dots     — bullet-journal dot grid
   * plain    — grain only, no ruling
   */
  variant?: PaperVariant;
}

const RULING: Record<Exclude<PaperVariant, "plain">, string> = {
  genkoyoshi: "paper-genkoyoshi",
  grid: "paper-grid",
  dots: "paper-dots",
};

export function PaperTexture({ variant = "genkoyoshi" }: PaperTextureProps) {
  // Rendered as <aside> rather than <div>: browser extensions (e.g. Scrnli)
  // inject stray <div>s into <body> before hydration. React skips unexpected
  // body children of a different tag, but tries to hydrate a same-tag one.
  return (
    <aside
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden"
    >
      {variant !== "plain" && (
        <div
          className={cn(
            "absolute inset-0 opacity-[0.075] dark:opacity-[0.05]",
            RULING[variant],
          )}
        />
      )}
      <div className="paper-grain absolute inset-0 opacity-[0.055] dark:opacity-[0.09]" />
      <div className="paper-vignette absolute inset-0" />
    </aside>
  );
}
