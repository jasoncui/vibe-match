import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { initializeOrUpdateSpotifyData } from "@/lib/spotify";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user && data.session) {
      // Successfully signed in, now initialize or update Spotify data
      try {
        await initializeOrUpdateSpotifyData(
          data.user.id,
          data.session.provider_token!
        );
      } catch (initError) {
        console.error("Error initializing Spotify data:", initError);
        // You might want to log this error or handle it in some way
        // For now, we'll continue with the redirect even if this fails
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
