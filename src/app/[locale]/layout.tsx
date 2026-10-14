import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk as FontDisplay,
  Inter as FontSans,
} from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/navbar";
import { PaperTexture } from "@/components/paper-texture";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { LOCALE_TAGS, routing } from "@/i18n/routing";
import {
  absoluteUrl,
  languageAlternates,
  localizedPath,
  ogImageUrl,
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const tHero = await getTranslations({ locale, namespace: "Hero" });

  const description = t("siteDescription", {
    name: DATA.name,
    location: t("location"),
  });
  const ogImage = `${ogImageUrl(DATA.name)}&subtitle=${encodeURIComponent(
    t("ogSubtitle"),
  )}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteTitle,
      template: `%s | ${DATA.name}`,
    },
    description,
    applicationName: DATA.name,
    keywords: SITE_KEYWORDS,
    authors: [{ name: DATA.name, url: SITE_URL }],
    creator: DATA.name,
    publisher: DATA.name,
    category: "technology",
    alternates: {
      canonical: localizedPath("/", locale),
      languages: languageAlternates("/"),
    },
    openGraph: {
      title: siteTitle,
      description: tHero("description"),
      url: absoluteUrl(localizedPath("/", locale)),
      siteName: DATA.name,
      locale: LOCALE_TAGS[locale].og,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => LOCALE_TAGS[l].og),
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
      description: tHero("description"),
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0e" },
  ],
  colorScheme: "light dark",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "mx-auto min-h-screen max-w-2xl bg-background px-6 py-12 font-sans antialiased sm:py-24 md:max-w-3xl",
          fontSans.variable,
          fontDisplay.variable,
        )}
      >
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <TooltipProvider delayDuration={0}>
              <PaperTexture variant="genkoyoshi" />
              {children}
              <Analytics />
              <SpeedInsights />
              <Navbar />
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
