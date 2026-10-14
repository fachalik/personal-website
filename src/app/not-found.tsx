// Requests the locale proxy skips (e.g. `/foo.php`) never reach [locale], so
// they render here inside the bare root layout and need their own <html>.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 font-sans text-foreground antialiased">
        <p className="font-bold text-7xl tracking-tighter">404</p>
        <p className="text-muted-foreground">This page could not be found.</p>
        <a href="/" className="text-sm underline underline-offset-4">
          Go home
        </a>
      </body>
    </html>
  );
}
