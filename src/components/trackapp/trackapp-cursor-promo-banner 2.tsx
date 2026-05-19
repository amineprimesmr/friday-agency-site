import Image from "next/image";

import "@/styles/trackapp-cursor-promo-banner.css";

const CURSOR_REFERRAL_URL = "https://cursor.com/referral?code=RECFVGCADKAE";

export function TrackappCursorPromoBanner() {
  return (
    <a
      href={CURSOR_REFERRAL_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="trackapp-cursor-promo"
      aria-label="Cursor à -50 % — offre partenaire Trackapp (nouvel onglet)"
    >
      <div className="trackapp-cursor-promo__pattern" aria-hidden />
      <div className="trackapp-cursor-promo__glow" aria-hidden />
      <span className="trackapp-cursor-promo__pill">
        <Image
          src="/assets/cursoricon.jpg"
          alt=""
          width={26}
          height={26}
          className="trackapp-cursor-promo__icon"
          unoptimized
        />
        <span className="trackapp-cursor-promo__label">Cursor à -50%</span>
      </span>
    </a>
  );
}
