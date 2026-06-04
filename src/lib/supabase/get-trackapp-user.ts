import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/** Une seule lecture session Supabase par requête RSC (layout + pages). */
export const getTrackappUser = cache(
  async (): Promise<{ sb: SupabaseClient | null; user: User | null }> => {
    const sb = await createClient();
    if (!sb) return { sb: null, user: null };
    const {
      data: { user },
    } = await sb.auth.getUser();
    return { sb, user };
  },
);
