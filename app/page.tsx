import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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

  console.log("user: ", user);

  const fetchTopTracks = async (token: string) => {
    const response = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch top tracks from Spotify");
      return { items: [] };
    }
  };

  const fetchTopArtists = async (token: string) => {
    const response = await fetch(
      "https://api.spotify.com/v1/me/top/artists?time_range=long_term",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch top artists from Spotify");
      return { items: [] };
    }
  };

  // Fetch the top tracks and top artists from Spotify
  const topTracks = await fetchTopTracks(token);
  const topArtists = await fetchTopArtists(token);

  // Format tracks and artists data for Supabase
  const tracksData = topTracks.items.map(
    (track: {
      id: any;
      name: any;
      album: { name: any; release_date: any; images: any };
      artists: any[];
      popularity: any;
    }) => ({
      id: track.id,
      user_id: user?.id,
      name: track.name,
      album: track.album.name,
      artists: track.artists.map((artist) => artist.name),
      release_date: track.album.release_date,
      popularity: track.popularity,
      images: track.album.images,
    })
  );

  const artistsData = topArtists.items.map(
    (artist: {
      id: any;
      name: any;
      genres: any;
      followers: { total: any };
      images: any;
    }) => ({
      id: artist.id,
      user_id: user?.id,
      name: artist.name,
      genres: artist.genres,
      followers: artist.followers.total,
      images: artist.images,
    })
  );

  // Store the fetched data into Supabase
  // await storeDataInSupabase(user.id, tracksData, "tracks");
  // await storeDataInSupabase(user.id, artistsData, "artists");

  // Calculate the basic score
  const basicScore =
    topTracks.items.reduce(
      (acc: any, track: { popularity: any }) => acc + track.popularity,
      0
    ) / topTracks.items.length;

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
          {topTracks.items.map((track: any, index: any) => (
            <div
              key={track.id}
              className="bg-white p-4 rounded-lg shadow-md flex items-center"
            >
              <span className="text-lg text-gray-600 font-bold mr-4">
                {index + 1}
              </span>
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="w-16 h-16 rounded-lg mr-4"
              />
              <div>
                <div className="text-black font-semibold">{track.name}</div>
                <div className="text-gray-600">
                  by{" "}
                  {track.artists
                    .map((artist: { name: any }) => artist.name)
                    .join(", ")}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Album: {track.album.name}
                </div>
                <div className="text-sm text-gray-500">
                  Release Date: {track.album.release_date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-2xl mb-4">Your Top Artists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topArtists.items.map((artist: any, index: any) => (
            <div
              key={artist.id}
              className="bg-white p-4 rounded-lg shadow-md flex items-center"
            >
              <span className="text-lg text-gray-600 font-bold mr-4">
                {index + 1}
              </span>
              <img
                src={artist.images[0]?.url}
                alt={artist.name}
                className="w-16 h-16 rounded-lg mr-4"
              />
              <div>
                <div className="text-black font-semibold">{artist.name}</div>
                <div className="text-gray-600">
                  Followers: {artist.followers.total.toLocaleString()}
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
