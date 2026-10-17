import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
  yOffset?: number;
}

/**
 * Fade + rise on first paint. Pure CSS (see `.blur-fade` in globals.css) so the
 * content is revealed without waiting for hydration, and it only animates
 * opacity/transform, which stay on the compositor.
 */
const BlurFade = ({
  children,
  className,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
}: BlurFadeProps) => (
  <div
    className={cn("blur-fade", className)}
    style={
      {
        "--blur-fade-delay": `${0.04 + delay}s`,
        "--blur-fade-duration": `${duration}s`,
        "--blur-fade-y": `${yOffset}px`,
      } as CSSProperties
    }
  >
    {children}
  </div>
);

export default BlurFade;
