import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch top tracks from Supabase
  const { data: topTracks, error: tracksError } = await supabase
    .from("user_top_tracks")
    .select("*")
    .eq("user_id", user.id)
    .order("popularity", { ascending: false })
    .limit(50);

  if (tracksError) {
    console.error("Error fetching top tracks:", tracksError);
  }

  // Fetch top artists from Supabase
  const { data: topArtists, error: artistsError } = await supabase
    .from("user_top_artists")
    .select("*")
    .eq("user_id", user.id)
    .order("followers", { ascending: false })
    .limit(50);

  if (artistsError) {
    console.error("Error fetching top artists:", artistsError);
  }

  // Calculate the basic score
  const basicScore =
    topTracks && topTracks.length > 0
      ? topTracks.reduce((acc, track) => acc + track.popularity, 0) /
        topTracks.length
      : 0;

  return (
    <div className="container mx-auto p-6 max-w-5xl pb-20">
      <header className="flex justify-between items-center py-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold">Vibe Match</h1>
        <AuthButton />
      </header>

      <div className="bg-gray-100 p-6 rounded-lg shadow-lg mb-10 mt-8">
        <h3 className="font-bold text-xl mb-2">Basic Score</h3>
        <p className="text-gray-700 mb-4">
          The basic score is the average popularity score of all your top
          tracks.
        </p>
        <p className="text-2xl font-semibold">{basicScore.toFixed(2)}</p>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-2xl mb-4">Your Top Tracks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topTracks &&
            topTracks.map((track, index) => (
              <div
                key={track.track_id}
                className="bg-white p-4 rounded-lg shadow-md flex items-center"
              >
                <span className="text-lg text-gray-600 font-bold mr-4">
                  {index + 1}
                </span>
                <img
                  src={track.image_url}
                  alt={track.name}
                  className="w-16 h-16 rounded-lg mr-4"
                />
                <div>
                  <div className="text-black font-semibold">{track.name}</div>
                  <div className="text-gray-600">
                    by {track.artists.join(", ")}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Album: {track.album}
                  </div>
                  <div className="text-sm text-gray-500">
                    Release Date: {track.release_date}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-2xl mb-4">Your Top Artists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topArtists &&
            topArtists.map((artist, index) => (
              <div
                key={artist.artist_id}
                className="bg-white p-4 rounded-lg shadow-md flex items-center"
              >
                <span className="text-lg text-gray-600 font-bold mr-4">
                  {index + 1}
                </span>
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  className="w-16 h-16 rounded-lg mr-4"
                />
                <div>
                  <div className="text-black font-semibold">{artist.name}</div>
                  <div className="text-gray-600">
                    Followers: {artist.followers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Genres: {artist.genres.join(", ")}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
