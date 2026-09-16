import { ImageResponse } from "next/og";
import { displayFonts, Monogram } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS applies its own rounding, so this one is full-bleed and square.
export default async function AppleIcon() {
  return new ImageResponse(<Monogram size={size.width} radius={0} />, {
    ...size,
    fonts: await displayFonts(),
  });
}
