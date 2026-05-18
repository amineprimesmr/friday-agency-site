"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

const TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "ads", label: "Publicités" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AppTabs({ active }: { active: TabId }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  function go(tab: TabId) {
    if (tab === active) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <LayoutGroup id="tracker-app-detail-tabs">
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1 scrollbar-none">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              className={`tracker-touch relative z-10 flex-1 shrink-0 overflow-hidden rounded-xl px-4 py-2 text-xs font-semibold transition-colors duration-200 ease-out ${
                isActive ? "text-white" : "text-white/45 hover:text-white/80"
              }`}
            >
              {isActive &&
                (reducedMotion ? (
                  <span
                    className="absolute inset-0 z-0 rounded-xl bg-white/10 shadow"
                    aria-hidden
                  />
                ) : (
                  <motion.span
                    layoutId="tracker-app-tab-pill"
                    className="absolute inset-0 z-0 rounded-xl bg-white/10 shadow"
                    aria-hidden
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 42,
                      mass: 0.72,
                    }}
                  />
                ))}
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
