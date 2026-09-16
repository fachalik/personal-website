import { ImageResponse } from "next/og";
import { displayFonts, Monogram } from "@/lib/og";

export const contentType = "image/png";

const SIZES = [32, 192, 512] as const;

export function generateImageMetadata() {
  return SIZES.map((size) => ({
    id: String(size),
    size: { width: size, height: size },
    contentType,
  }));
}

// Next 16 hands metadata routes their params asynchronously, and only ever
// with an id that generateImageMetadata above produced.
export default async function Icon({ id }: { id: Promise<string> }) {
  const size = Number(await id);

  return new ImageResponse(<Monogram size={size} />, {
    width: size,
    height: size,
    fonts: await displayFonts(),
  });
}
