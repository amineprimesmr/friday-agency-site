"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { trackappCreerDepuisAppHref } from "@/lib/trackapp-app-clone-paths";
import { readPreferredIde } from "@/lib/trackapp-clone-prompt/preferences";
import type { TrackappPreferredIde } from "@/lib/trackapp-clone-prompt/types";

type TrackappCreateAppCtaProps = Readonly<{
  appId: string;
  country: string;
}>;

export function TrackappCreateAppCta({ appId, country }: TrackappCreateAppCtaProps) {
  const [ide, setIde] = useState<TrackappPreferredIde>("cursor");
  const specHref = trackappCreerDepuisAppHref(appId, country);

  useEffect(() => {
    setIde(readPreferredIde());
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={specHref}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-violet-600 px-5 text-[0.88rem] font-bold text-white no-underline transition hover:bg-violet-700"
      >
        Créer cette app
      </Link>
      <Link
        href={`${specHref}${specHref.includes("?") ? "&" : "?"}open=${ide}`}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-4 text-[0.82rem] font-bold text-violet-900 no-underline transition hover:bg-violet-100"
        title={ide === "cursor" ? "Configurer puis ouvrir Cursor" : "Configurer puis ouvrir Claude Code"}
      >
        {ide === "cursor" ? "Cursor" : "Claude"} →
      </Link>
    </div>
  );
}
