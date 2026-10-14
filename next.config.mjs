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
};

export default withNextIntl(nextConfig);
