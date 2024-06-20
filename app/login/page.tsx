import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SpotifyButton from "@/components/SpotifyButton";
import { initializeOrUpdateSpotifyData } from "@/lib/spotify";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const handleSignIn = async () => {
    "use server";

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        scopes: "user-top-read",
        redirectTo:
          process.env.NODE_ENV === "development"
            ? `http://localhost:3000/auth/callback`
            : `https://vibe-match.vercel.app/auth/callback`,
      },
    });

    if (error) {
      console.error("Error signing in with Spotify:", error);
    }

    return redirect(data?.url ?? "");
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <SpotifyButton handleSignIn={handleSignIn} />
      </form>
    </div>
  );
}
