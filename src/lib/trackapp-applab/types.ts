export type AppLabConfidence = "high" | "medium" | "low";
export type AppLabGoVerdict = "launch" | "pivot" | "avoid";

export type AppLabOpportunityFormat = Readonly<{
  name: string;
  description: string;
  opportunity_score: number;
  weeks_to_mvp: number;
  revenue_month_6: string;
}>;

export type AppLabReport = Readonly<{
  meta: Readonly<{
    app_id: string;
    app_name: string;
    generated_at: string;
    confidence: AppLabConfidence;
    opportunity_score: number;
    go_verdict: AppLabGoVerdict;
    executive_summary: string;
  }>;
  insight: Readonly<{
    headline: string;
    why_it_works: string;
    monetization_hook: string;
    bullets: readonly string[];
  }>;
  opportunities: Readonly<{
    angle: string;
    formats: readonly AppLabOpportunityFormat[];
  }>;
  action: Readonly<{
    verdict: string;
    stack: string;
    mvp_timeline: string;
    revenue_month_6: string;
    this_week: readonly string[];
    main_risk: string;
  }>;
}>;

export type AppLabAnalyzeFailure =
  | "openai_missing_key"
  | "openai_http"
  | "openai_empty"
  | "openai_parse"
  | "context_missing";

export type AppLabAnalyzeResult = Readonly<{
  report: AppLabReport | null;
  failure?: AppLabAnalyzeFailure;
  failureDetail?: string;
}>;
