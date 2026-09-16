import fs from "node:fs/promises";
import path from "node:path";
import type { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

// Derived from next/og's own signature, so a future change to the font shape
// surfaces as a compile error here rather than at render time.
type OgFont = NonNullable<
  NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]
>[number];

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

let cached: Promise<OgFont[]> | undefined;

async function load(): Promise<OgFont[]> {
  const [bold, medium] = await Promise.all([
    fs.readFile(path.join(FONT_DIR, "SpaceGrotesk-Bold.ttf")),
    fs.readFile(path.join(FONT_DIR, "SpaceGrotesk-Medium.ttf")),
  ]);

  return [
    { name: "Space Grotesk", data: bold, weight: 700, style: "normal" },
    { name: "Space Grotesk", data: medium, weight: 500, style: "normal" },
  ];
}

/**
 * Space Grotesk — the same display face the site uses — for ImageResponse.
 * Read from disk (see `outputFileTracingIncludes` in next.config.mjs) rather
 * than fetched, so generating a card never depends on the network.
 */
export function displayFonts() {
  cached ??= load();
  return cached;
}

/**
 * The site's "F" mark. Space Grotesk's F sits right of and above the em box
 * centre (side bearing plus cap height), so it is nudged back optically —
 * the offsets are measured, not guessed.
 */
export function Monogram({
  size,
  radius = 0.22,
}: {
  size: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.indigo,
        borderRadius: size * radius,
        color: BRAND.cream,
        fontFamily: "Space Grotesk",
        fontWeight: 700,
        fontSize: size * 0.8,
        paddingRight: size * 0.027,
        paddingTop: size * 0.01,
      }}
    >
      F
    </div>
  );
}
