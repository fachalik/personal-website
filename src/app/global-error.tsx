"use client";

import "./globals.css";

// Replaces the root layout when it throws, so it can't rely on providers,
// translations or fonts from [locale]/layout.tsx.
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4 px-6 font-sans antialiased">
        <title>Something went wrong</title>
        <p className="text-7xl font-bold tracking-tighter">500</p>
        <p className="text-muted-foreground">Something went wrong.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="text-sm underline underline-offset-4"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
