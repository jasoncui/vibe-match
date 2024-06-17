import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import ConnectSupabaseSteps from "@/components/tutorial/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <div>Vibe Match</div>
          {<AuthButton />}
        </div>
      </nav>
      {user ? (
        <div>You're logged in.</div>
      ) : (
        <div>
          Vibe match connects to your Spotify and sees how your music vibes
          match up with your friends. You are not logged in.
        </div>
      )}
    </div>
  );
}
