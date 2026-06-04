/** Schéma JSON strict — rapport AppLAB simplifié (4 blocs). */

const stringArray = (maxItems: number) => ({
  type: "array" as const,
  maxItems,
  items: { type: "string" as const },
});

export const APPLAB_REPORT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    meta: {
      type: "object",
      additionalProperties: false,
      properties: {
        app_id: { type: "string" },
        app_name: { type: "string" },
        generated_at: { type: "string" },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
        opportunity_score: { type: "number" },
        go_verdict: { type: "string", enum: ["launch", "pivot", "avoid"] },
        executive_summary: { type: "string" },
      },
      required: [
        "app_id",
        "app_name",
        "generated_at",
        "confidence",
        "opportunity_score",
        "go_verdict",
        "executive_summary",
      ],
    },
    insight: {
      type: "object",
      additionalProperties: false,
      properties: {
        headline: { type: "string" },
        why_it_works: { type: "string" },
        monetization_hook: { type: "string" },
        bullets: stringArray(3),
      },
      required: ["headline", "why_it_works", "monetization_hook", "bullets"],
    },
    opportunities: {
      type: "object",
      additionalProperties: false,
      properties: {
        angle: { type: "string" },
        formats: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              opportunity_score: { type: "number" },
              weeks_to_mvp: { type: "number" },
              revenue_month_6: { type: "string" },
            },
            required: ["name", "description", "opportunity_score", "weeks_to_mvp", "revenue_month_6"],
          },
        },
      },
      required: ["angle", "formats"],
    },
    action: {
      type: "object",
      additionalProperties: false,
      properties: {
        verdict: { type: "string" },
        stack: { type: "string" },
        mvp_timeline: { type: "string" },
        revenue_month_6: { type: "string" },
        this_week: stringArray(3),
        main_risk: { type: "string" },
      },
      required: ["verdict", "stack", "mvp_timeline", "revenue_month_6", "this_week", "main_risk"],
    },
  },
  required: ["meta", "insight", "opportunities", "action"],
} as const;
