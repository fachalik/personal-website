import { notFound } from "next/navigation";

// Unmatched paths under a locale land here so they get the localized
// [locale]/not-found.tsx (with navbar and theme) instead of the bare root one.
export default function CatchAll() {
  notFound();
}
