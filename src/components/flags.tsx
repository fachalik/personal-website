import { type SVGProps, useId } from "react";
import type { Locale } from "@/i18n/routing";

type FlagProps = SVGProps<SVGSVGElement>;

function UnitedKingdomFlag(props: FlagProps) {
  // Ids must be unique per instance: the flag renders in both the trigger and the menu.
  const id = useId();
  return (
    <svg
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      {...props}
    >
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath={`url(#${id}-t)`}
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

function IndonesiaFlag(props: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" preserveAspectRatio="none" aria-hidden {...props}>
      <rect width="3" height="2" fill="#fff" />
      <rect width="3" height="1" fill="#CE1126" />
    </svg>
  );
}

export const FLAGS: Record<Locale, (props: FlagProps) => React.ReactNode> = {
  en: UnitedKingdomFlag,
  id: IndonesiaFlag,
};
