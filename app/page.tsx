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

  const fetchTopTracks = async (token) => {
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch top tracks from Spotify");
      return { items: [] };
    }
  };

  const fetchTopArtists = async (token) => {
    const response = await fetch("https://api.spotify.com/v1/me/top/artists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch top artists from Spotify");
      return { items: [] };
    }
  };

  // Fetch the top tracks from Spotify
  const topTracks = await fetchTopTracks(token);

  // Fetch the top artists from Spotify
  const topArtists = await fetchTopArtists(token);

  // Calculate the basic score
  const basicScore =
    topTracks.items.reduce((acc, track) => acc + track.popularity, 0) /
    topTracks.items.length;

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <div>Vibe Match</div>
          {<AuthButton />}
        </div>
      </nav>
      {user ? (
        <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3 pb-20">
          <main className="flex-1 flex flex-col gap-10">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-10">
              <h3 className="font-bold text-xl mb-2 text-black">Basic Score</h3>
              <p className="text-gray-700 mb-4">
                The basic score is the average popularity score of all your top
                tracks.
              </p>
              <p className="text-2xl font-semibold text-black">
                {basicScore.toFixed(2)}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="font-bold text-2xl text-black">Your Top Tracks</h3>
            </div>
            <ul className="space-y-4">
              {topTracks.items.map((track, index) => (
                <li
                  key={track.id}
                  className="flex items-center space-x-4 p-4 rounded-lg"
                >
                  <span className="text-lg text-gray-600 font-bold">
                    {index + 1}
                  </span>
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-16 h-16 rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="text-black font-semibold">{track.name}</div>
                    <div className="text-gray-600">
                      by {track.artists.map((artist) => artist.name).join(", ")}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Album: {track.album.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Release Date: {track.album.release_date}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <h3 className="font-bold text-2xl text-black mb-4">
                Your Top Artists
              </h3>
              <ul className="space-y-4">
                {topArtists.items.map((artist, index) => (
                  <li
                    key={artist.id}
                    className="flex items-center space-x-4 p-4 rounded-lg"
                  >
                    <span className="text-lg text-gray-600 font-bold">
                      {index + 1}
                    </span>
                    <img
                      src={artist.images[0]?.url}
                      alt={artist.name}
                      className="w-16 h-16 rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="text-black font-semibold">
                        {artist.name}
                      </div>
                      <div className="text-gray-600">
                        Followers: {artist.followers.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Genres: {artist.genres.join(", ")}
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
