export type CompetitorType = "direct" | "close" | "indirect" | "old" | "rising";

export type CompetitorConfidence = "high" | "medium" | "low";

export type AppUnderstandingProfile = Readonly<{
  core_problem: string;
  target_user: string;
  main_use_case: string;
  secondary_use_cases: string[];
  category: string;
  positioning: string;
  main_features: string[];
  monetization: string;
  marketing_angles: string[];
  keywords: string[];
  not_competitors: string[];
  competitor_categories: string[];
}>;

export type CompetitorTractionSignals = Readonly<{
  rating: string;
  reviews_count: string;
  social_activity: string;
  ads_activity: string;
  ranking: string;
}>;

export type CompetitorSocialLinks = Readonly<{
  instagram: string;
  tiktok: string;
  x: string;
  youtube: string;
  facebook: string;
  linkedin: string;
}>;

export type CompetitorCandidate = Readonly<{
  name: string;
  type: CompetitorType;
  similarity_score: number;
  reason: string;
  app_store_url: string | null;
  google_play_url: string | null;
  website: string | null;
  category: string;
  description: string;
  shared_features: string[];
  differences: string[];
  target_user: string;
  pricing: string;
  traction_signals: CompetitorTractionSignals;
  social_links: CompetitorSocialLinks;
  meta_ads_library: string | null;
  confidence: CompetitorConfidence;
}>;

export type CompetitorIntelligenceReport = Readonly<{
  source_app: Readonly<{
    name: string;
    core_problem: string;
    target_user: string;
    category: string;
    positioning: string;
    main_features: string[];
    not_competitors: string[];
  }>;
  understanding: AppUnderstandingProfile;
  competitor_categories: ReadonlyArray<{
    name: string;
    description: string;
    apps: string[];
  }>;
  competitors: CompetitorCandidate[];
  rejected_apps: ReadonlyArray<{ name: string; reason: string }>;
  search_queries_used: string[];
  generated_at: string;
}>;

export type HydratedCompetitor = CompetitorCandidate &
  Readonly<{
    app_id: string | null;
    artwork_url: string | null;
    artist_name: string | null;
    /** Lien App Store validé (iTunes) — absent si retrait / ID LLM invalide. */
    app_store_unavailable?: boolean;
    trackapp_metrics?: Readonly<{
      downloadsDisplay: string;
      revenueDisplay: string;
      metricSource: string;
    }>;
  }>;

export type HydratedCompetitorReport = Omit<CompetitorIntelligenceReport, "competitors"> &
  Readonly<{
    competitors: HydratedCompetitor[];
  }>;
