import "./globals.css";

// The real <html> shell lives in [locale]/layout.tsx so `lang` can follow the URL.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
