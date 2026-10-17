import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface BlurFadeTextProps {
  text: string;
  className?: string;
  /** Seconds. */
  delay?: number;
  yOffset?: number;
}

/** Text variant of BlurFade; same CSS-only animation. */
const BlurFadeText = ({
  text,
  className,
  delay = 0,
  yOffset = 8,
}: BlurFadeTextProps) => (
  <div className="flex">
    <span
      className={cn("inline-block blur-fade", className)}
      style={
        {
          "--blur-fade-delay": `${delay}s`,
          "--blur-fade-y": `${yOffset}px`,
        } as CSSProperties
      }
    >
      {text}
    </span>
  </div>
);

export default BlurFadeText;
