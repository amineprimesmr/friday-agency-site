import type { AppLabConfidence, AppLabGoVerdict, AppLabReport } from "@/lib/trackapp-applab/types";
import type { AppLabContext } from "@/lib/trackapp-applab/build-context";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function asStringArray(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}

function asNumber(v: unknown, fallback = 0, min = 0, max = 100): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, v));
}

function asConfidence(v: unknown): AppLabConfidence {
  const s = asString(v);
  if (s === "high" || s === "medium" || s === "low") return s;
  return "medium";
}

function asVerdict(v: unknown): AppLabGoVerdict {
  const s = asString(v);
  if (s === "launch" || s === "pivot" || s === "avoid") return s;
  return "pivot";
}

export function parseAppLabReport(raw: unknown, ctx: AppLabContext): AppLabReport | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const meta = (o.meta as Record<string, unknown> | undefined) ?? {};
  const insight = (o.insight as Record<string, unknown> | undefined) ?? {};
  const opportunities = (o.opportunities as Record<string, unknown> | undefined) ?? {};
  const action = (o.action as Record<string, unknown> | undefined) ?? {};

  const formats = (Array.isArray(opportunities.formats) ? opportunities.formats : [])
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const f = item as Record<string, unknown>;
      const name = asString(f.name);
      if (!name) return null;
      return {
        name,
        description: asString(f.description),
        opportunity_score: asNumber(f.opportunity_score, 50),
        weeks_to_mvp: asNumber(f.weeks_to_mvp, 8, 1, 52),
        revenue_month_6: asString(f.revenue_month_6, "—"),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const headline = asString(insight.headline);
  if (!headline && formats.length === 0) return null;

  return {
    meta: {
      app_id: asString(meta.app_id, ctx.app.id),
      app_name: asString(meta.app_name, ctx.app.name),
      generated_at: asString(meta.generated_at, new Date().toISOString()),
      confidence: asConfidence(meta.confidence),
      opportunity_score: asNumber(meta.opportunity_score, 50),
      go_verdict: asVerdict(meta.go_verdict),
      executive_summary: asString(meta.executive_summary, `Analyse AppLAB pour ${ctx.app.name}.`),
    },
    insight: {
      headline: headline || "Opportunité à explorer",
      why_it_works: asString(insight.why_it_works),
      monetization_hook: asString(insight.monetization_hook),
      bullets: asStringArray(insight.bullets, 3),
    },
    opportunities: {
      angle: asString(opportunities.angle),
      formats,
    },
    action: {
      verdict: asString(action.verdict),
      stack: asString(action.stack, "SwiftUI + RevenueCat"),
      mvp_timeline: asString(action.mvp_timeline, "6–10 semaines"),
      revenue_month_6: asString(action.revenue_month_6, "—"),
      this_week: asStringArray(action.this_week, 3),
      main_risk: asString(action.main_risk),
    },
  };
}
