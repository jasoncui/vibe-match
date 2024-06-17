import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ConnectSupabaseSteps from "@/components/tutorial/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: session } = await supabase.auth.getSession();

  if (!session || !session.session || !session.session.provider_token) {
    return redirect("/login");
  }

  const token = session.session.provider_token;

  const fetchTopTracks = async (token: string) => {
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = response.json();
      console.log(data);
      return data;
    } else {
      console.error("Failed to fetch top tracks from Spotify");
      return { items: [] };
    }
  };

  // Fetch the top tracks from Spotify
  const topTracks = await fetchTopTracks(token);

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <div>Vibe Match</div>
          {<AuthButton />}
        </div>
      </nav>
      {user ? (
        <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
          <main className="flex-1 flex flex-col gap-6">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-2xl mb-6 text-white">
                Your Top Tracks
              </h3>
              <ul className="space-y-4">
                {topTracks.items.map((track: any, index: number) => (
                  <li
                    key={track.id}
                    className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg"
                  >
                    <span className="text-lg text-gray-400 font-bold">
                      {index + 1}
                    </span>
                    <img
                      src={track.album.images[0].url}
                      alt={track.name}
                      className="w-16 h-16 rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="text-white font-semibold">
                        {track.name}
                      </div>
                      <div className="text-gray-400">
                        by{" "}
                        {track.artists
                          .map((artist: { name: any }) => artist.name)
                          .join(", ")}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {/* Genres: {track.genres.slice(0, 3).join(", ")} */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        </div>
      ) : (
        <div>
          Vibe match connects to your Spotify and sees how your music vibes
          match up with your friends. You are not logged in.
        </div>
      )}
    </div>
  );
}
