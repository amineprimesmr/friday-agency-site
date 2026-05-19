import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getTrackappRouteUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* ignore */
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) return null;
  return user;
}

export function appOriginFromEnv(): string {
  const originRaw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!originRaw) return "http://127.0.0.1:3000";
  return /^https?:\/\//i.test(originRaw) ?
      originRaw.replace(/\/$/, "")
    : `http://${originRaw.replace(/\/$/, "")}`;
}
