import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emits .next/standalone for the Docker image.
  output: "standalone",
  // The /og route reads these at request time, so they must ship with it.
  outputFileTracingIncludes: {
    "/og": ["./src/assets/fonts/**"],
  },
  experimental: {
    // Tailwind output is small; inlining it removes the render-blocking request.
    inlineCss: true,
  },
  // One canonical host. Serving both apex and www left the apex pages with a
  // canonical pointing at www, which Lighthouse flags as invalid.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "fachalik.my.id" }],
        destination: "https://www.fachalik.my.id/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
