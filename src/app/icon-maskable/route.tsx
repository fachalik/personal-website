import { ImageResponse } from "next/og";
import { displayFonts, Monogram } from "@/lib/og";

const SIZE = 512;

// Prerendered at build; nothing here depends on the request.
export const dynamic = "force-static";

/**
 * The manifest's maskable icon. Android applies its own mask, so this one is
 * full-bleed — the rounded corners of /icon/512 would leave transparent
 * notches once masked. Kept off the metadata `icon` convention on purpose, so
 * it does not add a second 512x512 <link rel="icon"> to every page.
 */
export async function GET() {
  return new ImageResponse(<Monogram size={SIZE} radius={0} />, {
    width: SIZE,
    height: SIZE,
    fonts: await displayFonts(),
  });
}
