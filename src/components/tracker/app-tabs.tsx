"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "ads", label: "Publicités" },
  { id: "rankings", label: "Classements" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AppTabs({ active }: { active: TabId }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(tab: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1 scrollbar-none">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => go(t.id)}
          className={`flex-1 shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            active === t.id
              ? "bg-white/10 text-white shadow"
              : "text-white/45 hover:text-white/80"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
