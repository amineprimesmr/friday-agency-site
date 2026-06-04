import type { ApplabMvpPromptBlueprint } from "@/lib/trackapp-applab-create/mvp-prompt-types";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function asStringArray(v: unknown, max = 24): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function parseApplabMvpPromptBlueprint(raw: unknown): ApplabMvpPromptBlueprint | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const appWorkingName = asString(o.app_working_name);
  const oneLiner = asString(o.one_liner);
  if (!appWorkingName || !oneLiner) return null;

  const screensRaw = Array.isArray(o.screens) ? o.screens : [];
  const screens = screensRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const s = item as Record<string, unknown>;
      const id = asString(s.id);
      const title = asString(s.title);
      const purpose = asString(s.purpose);
      if (!id || !title || !purpose) return null;
      return {
        id,
        title,
        purpose,
        key_components: asStringArray(s.key_components, 8),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .slice(0, 10);

  if (screens.length < 3) return null;

  const onboardingRaw = Array.isArray(o.onboarding_steps) ? o.onboarding_steps : [];
  const onboarding_steps = onboardingRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const s = item as Record<string, unknown>;
      const screen_id = asString(s.screen_id);
      const headline = asString(s.headline);
      const body = asString(s.body);
      if (!screen_id || !headline) return null;
      return {
        step: asNumber(s.step, 1),
        screen_id,
        headline,
        body: body || headline,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .slice(0, 6);

  const modelsRaw = Array.isArray(o.data_models) ? o.data_models : [];
  const data_models = modelsRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const m = item as Record<string, unknown>;
      const name = asString(m.name);
      if (!name) return null;
      return {
        name,
        fields: asStringArray(m.fields, 12),
        notes: asString(m.notes, "—"),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .slice(0, 8);

  const productsRaw = Array.isArray(o.iap_products) ? o.iap_products : [];
  const iap_products = productsRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const p = item as Record<string, unknown>;
      const product_id = asString(p.product_id);
      const type = asString(p.type);
      const label = asString(p.label);
      if (!product_id || !label) return null;
      return {
        product_id,
        type: type || "subscription",
        label,
        description: asString(p.description, label),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .slice(0, 4);

  if (iap_products.length === 0) return null;

  return {
    app_working_name: appWorkingName,
    one_liner: oneLiner,
    value_proposition: asString(o.value_proposition, oneLiner),
    screens,
    onboarding_steps,
    data_models,
    iap_model: asString(o.iap_model, "Freemium avec abonnement"),
    paywall_trigger: asString(o.paywall_trigger, "Après la valeur démontrée (onboarding + 1ère action clé)"),
    iap_products,
    analytics_events: asStringArray(o.analytics_events, 16),
    folder_structure: asStringArray(o.folder_structure, 24),
    coding_rules: asStringArray(o.coding_rules, 16),
    negative_prompts: asStringArray(o.negative_prompts, 16),
    apple_compliance: asStringArray(o.apple_compliance, 12),
    accessibility: asStringArray(o.accessibility, 10),
    execution_phases: asStringArray(o.execution_phases, 8),
  trackapp_resource_ids: asStringArray(o.trackapp_resource_ids, 12),
  };
}
