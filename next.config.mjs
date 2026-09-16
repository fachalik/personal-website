/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The /og route reads these at request time, so they must ship with it.
  outputFileTracingIncludes: {
    "/og": ["./src/assets/fonts/**"],
  },
};

export default nextConfig;
