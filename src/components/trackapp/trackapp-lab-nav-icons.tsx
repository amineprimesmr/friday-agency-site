import type { SVGProps } from "react";

import { HEART_ICON_PATH } from "@/components/icons/heart-icon";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconNavAccueil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M6 20v-1.25A4 4 0 0 1 10 15h4a4 4 0 0 1 4 3.75V20" />
    </svg>
  );
}

export function IconNavHeart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d={HEART_ICON_PATH} />
    </svg>
  );
}

export function IconNavNotes(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

export function IconNavChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19V5M10 19V11M16 19V8M22 19V3" />
    </svg>
  );
}

export function IconNavBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
    </svg>
  );
}

export function IconNavDiamond(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 20 9.5 12 21 4 9.5Z" />
    </svg>
  );
}

export function IconNavSparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2Z" />
      <path d="M5 17l.7 2.1L8 20l-2.3.9L5 23l-.7-2.1L2 20l2.3-.9Z" />
    </svg>
  );
}

export function IconNavFile(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function IconNavSoftware(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function IconNavOrganic(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 20c0-6 4-10 10-10h4v4c0 6-4 10-10 10H7z" />
      <path d="M9 18c2-4 5-6 9-6" />
    </svg>
  );
}

/** Panneau latéral — fermer (menu ouvert). */
export function IconPanelClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M9 5v14" />
    </svg>
  );
}

/** Panneau latéral — ouvrir (menu rangé). */
export function IconPanelOpen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M9 5v14" />
      <path d="M13 12h5" />
      <path d="M15.5 9.5 18 12l-2.5 2.5" />
    </svg>
  );
}
