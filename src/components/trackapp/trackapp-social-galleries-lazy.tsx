"use client";

import { TrackappInstagramOrganicGallery } from "@/components/trackapp/trackapp-instagram-organic-gallery";
import { TrackappTikTokOrganicGallery } from "@/components/trackapp/trackapp-tiktok-organic-gallery";

export function TrackappSocialGalleriesLazy({
  instagramProfileUrl,
  tiktokProfileUrl,
}: Readonly<{
  instagramProfileUrl: string | null | undefined;
  tiktokProfileUrl: string | null | undefined;
}>) {
  if (!instagramProfileUrl && !tiktokProfileUrl) return null;

  return (
    <>
      {instagramProfileUrl ? (
        <TrackappInstagramOrganicGallery profileUrl={instagramProfileUrl} />
      ) : null}
      {tiktokProfileUrl ? <TrackappTikTokOrganicGallery profileUrl={tiktokProfileUrl} /> : null}
    </>
  );
}
