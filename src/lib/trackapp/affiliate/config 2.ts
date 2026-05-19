/** Réduction affichée (et appliquée si STRIPE_COUPON_ID_REFERRAL_FRIEND est défini) pour les filleuls via lien d’affiliation. */
export const AFFILIATE_FRIEND_DISCOUNT_PERCENT = 40;

/** Commission fixe par filleul actif et par mois de MRR (20 €). */
export const AFFILIATE_COMMISSION_MRR_CENTS = 2000;

export const AFFILIATE_COMMISSION_MRR_EUR = AFFILIATE_COMMISSION_MRR_CENTS / 100;

/** Délai avant qu'une commission devienne disponible au retrait (chargebacks). */
export const AFFILIATE_HOLDING_DAYS = 14;

/** Seuil minimal de retrait en centimes (50 €). */
export const AFFILIATE_MIN_PAYOUT_CENTS = 5000;

export const AFFILIATE_REF_COOKIE = "trackapp_ref";

export const AFFILIATE_REF_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90;
