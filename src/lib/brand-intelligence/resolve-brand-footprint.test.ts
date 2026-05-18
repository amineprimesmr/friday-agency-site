import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { facebookGraphIdentifierFromUrl } from "@/lib/meta-page-resolve";
import { metaAdLibraryWebUrl } from "@/lib/meta-ad-library";
import { detectProfileFromUrl } from "@/lib/social-presence";

describe("brand ads resolution primitives", () => {
  it("extracts Facebook identifiers without falling back to keyword semantics", () => {
    assert.equal(facebookGraphIdentifierFromUrl("https://www.facebook.com/calaiapp"), "calaiapp");
    assert.equal(facebookGraphIdentifierFromUrl("https://www.facebook.com/profile.php?id=123456789"), "123456789");
    assert.equal(facebookGraphIdentifierFromUrl("https://www.facebook.com/ads/library/?q=Cal%20AI"), null);
  });

  it("detects social profiles used by the brand footprint UI", () => {
    assert.equal(detectProfileFromUrl("https://www.instagram.com/calai.app/")?.id, "instagram");
    assert.equal(detectProfileFromUrl("https://www.tiktok.com/@calai")?.hint, "@calai");
    assert.equal(detectProfileFromUrl("https://www.snapchat.com/add/calai")?.id, "snapchat");
  });

  it("builds exact page URLs when a Page ID exists", () => {
    const url = metaAdLibraryWebUrl({ searchPageIds: ["123456789"], keywordFallback: "Cal AI" });
    assert.match(url, /view_all_page_id=123456789/);
    assert.doesNotMatch(url, /search_type=keyword_unordered/);
  });
});
