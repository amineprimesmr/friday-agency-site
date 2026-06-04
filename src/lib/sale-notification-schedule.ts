export type SaleNotificationScheduleProfile = "hero" | "banner" | "banner-first";

const SCHEDULE_PROFILES = {
  hero: {
    minMs: 9_000,
    maxMs: 19_000,
    jitterMaxMs: 5_500,
    longPauseChance: 0.24,
    longPauseMultiplier: [1.35, 2.1] as const,
  },
  banner: {
    minMs: 8_000,
    maxMs: 18_000,
    jitterMaxMs: 4_500,
    longPauseChance: 0.2,
    longPauseMultiplier: [1.25, 1.75] as const,
  },
  "banner-first": {
    minMs: 3_000,
    maxMs: 6_500,
    jitterMaxMs: 1_800,
    longPauseChance: 0.08,
    longPauseMultiplier: [1.15, 1.4] as const,
  },
} as const;

/** Délai aléatoire irrégulier — évite le rythme mécanique d’un setInterval fixe. */
export function nextIrregularSaleDelayMs(profile: SaleNotificationScheduleProfile): number {
  const { minMs, maxMs, jitterMaxMs, longPauseChance, longPauseMultiplier } =
    SCHEDULE_PROFILES[profile];

  let delay = minMs + Math.random() * (maxMs - minMs);

  if (Math.random() < 0.38) {
    delay += Math.random() * jitterMaxMs;
  }

  if (Math.random() < longPauseChance) {
    const [lo, hi] = longPauseMultiplier;
    delay *= lo + Math.random() * (hi - lo);
  }

  return Math.round(delay);
}

export function nextBannerDisplayMs(): number {
  return Math.round(2_800 + Math.random() * 1_400);
}
