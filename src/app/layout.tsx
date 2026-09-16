import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk as FontDisplay,
  Inter as FontSans,
} from "next/font/google";
import Navbar from "@/components/navbar";
import { PaperTexture } from "@/components/paper-texture";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import {
  ogImageUrl,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_URL,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = FontDisplay({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteTitle = `${DATA.name} — Frontend Developer`;
const ogImage = `${ogImageUrl(DATA.name)}&subtitle=${encodeURIComponent(
  "Frontend Developer in South Jakarta, Indonesia",
)}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteTitle,
    template: `%s | ${DATA.name}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: DATA.name,
  keywords: SITE_KEYWORDS,
  authors: [{ name: DATA.name, url: SITE_URL }],
  creator: DATA.name,
  publisher: DATA.name,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: DATA.description,
    url: SITE_URL,
    siteName: DATA.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: DATA.description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0e" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased max-w-2xl md:max-w-3xl mx-auto py-12 sm:py-24 px-6",
          fontSans.variable,
          fontDisplay.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider delayDuration={0}>
            <PaperTexture variant="genkoyoshi" />
            {children}
            <Analytics />
            <SpeedInsights />
            <Navbar />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
