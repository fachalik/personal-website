import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { DATA } from "@/data/resume";
import { BRAND } from "@/lib/brand";
import { displayFonts, Monogram } from "@/lib/og";
import { SITE_URL } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Long headlines get smaller type so they always fit in three lines. */
function titleSize(title: string) {
  if (title.length > 60) return 60;
  if (title.length > 36) return 74;
  return 88;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title")?.slice(0, 120) || DATA.name;
  const subtitle = searchParams.get("subtitle")?.slice(0, 160) ?? "";
  const domain = SITE_URL.replace(/^https?:\/\//, "").replace(/^www\./, "");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        background: BRAND.cream,
        padding: "72px 80px",
        fontFamily: "Space Grotesk",
      }}
    >
      {/* Genkoyoshi-style rules, echoing the paper texture on the site. */}
      {[200, 400, 600, 800, 1000].map((x) => (
        <div
          key={x}
          style={{
            position: "absolute",
            top: 0,
            left: x,
            width: 1,
            height: "100%",
            background: "rgba(79, 70, 229, 0.10)",
          }}
        />
      ))}
      {[210, 420].map((y) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: 0,
            top: y,
            height: 1,
            width: "100%",
            background: "rgba(79, 70, 229, 0.10)",
          }}
        />
      ))}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            width: 72,
            height: 10,
            borderRadius: 5,
            background: BRAND.indigo,
          }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: titleSize(title),
            fontWeight: 700,
            letterSpacing: -2.5,
            lineHeight: 1.08,
            color: BRAND.ink,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 30,
              fontWeight: 500,
              lineHeight: 1.35,
              color: "rgba(10, 11, 13, 0.62)",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Monogram size={64} radius={0.23} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.ink }}>
            {DATA.name}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "rgba(10, 11, 13, 0.55)",
            }}
          >
            {domain}
          </div>
        </div>
      </div>
    </div>,
    { ...size, fonts: await displayFonts() },
  );
}
