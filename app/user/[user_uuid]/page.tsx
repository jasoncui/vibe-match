import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
  params: {
    user_uuid: string;
  };
}

export default async function UserProfile({ params }: PageProps) {
  const { user_uuid } = params;
  const supabase = createClient();

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user_uuid)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile data:", profileError?.message);
    notFound();
  }

  // Fetch basic score
  const { data: spotifyData, error: spotifyDataError } = await supabase
    .from("user_spotify_data")
    .select("basic_score")
    .eq("user_id", user_uuid)
    .single();

  if (spotifyDataError) {
    console.error("Error fetching Spotify data:", spotifyDataError.message);
  }

  const basicScore = spotifyData?.basic_score;

  // Fetch top tracks
  const { data: topTracks, error: tracksError } = await supabase
    .from("user_top_tracks")
    .select("*")
    .eq("user_id", user_uuid)
    .order("popularity", { ascending: false })
    .limit(10);

  if (tracksError) {
    console.error("Error fetching top tracks:", tracksError.message);
  }

  // Fetch top artists
  const { data: topArtists, error: artistsError } = await supabase
    .from("user_top_artists")
    .select("*")
    .eq("user_id", user_uuid)
    .order("followers", { ascending: false })
    .limit(10);

  if (artistsError) {
    console.error("Error fetching top artists:", artistsError.message);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-900 h-48 relative">
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-white">
            <Image
              src={profile.avatar_url || "/profile-placeholder.jpg"}
              alt="Profile Picture"
              width={150}
              height={150}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div className="ml-40">
              <h1 className="text-3xl font-bold">
                {profile.full_name || "Spotify User"}
              </h1>
              <p className="text-gray-600">@{profile.username || "username"}</p>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                Follow
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100">
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Basic Score</h2>
              <p className="text-gray-700 mb-2">
                The basic score is the average popularity score of all your top
                tracks.
              </p>
              <p className="text-4xl font-bold text-indigo-600">
                {basicScore !== null && basicScore !== undefined
                  ? basicScore.toFixed(2)
                  : "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Top Tracks</h2>
                <ul className="space-y-4">
                  {topTracks &&
                    topTracks.map((track) => (
                      <li
                        key={track.track_id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                          <Image
                            src={track.image_url || "/track-placeholder.jpg"}
                            alt={track.name}
                            width={50}
                            height={50}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{track.name}</p>
                          <p className="text-sm text-gray-500">
                            {track.artists.join(", ")}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Top Artists</h2>
                <ul className="space-y-4">
                  {topArtists &&
                    topArtists.map((artist) => (
                      <li
                        key={artist.artist_id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                          <Image
                            src={artist.image_url || "/artist-placeholder.jpg"}
                            alt={artist.name}
                            width={50}
                            height={50}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{artist.name}</p>
                          <p className="text-sm text-gray-500">
                            {artist.genres.slice(0, 3).join(", ")}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Spotify Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-500">Email</h3>
                  <p>{profile.email}</p>
                </div>
                <div>
                  <h3 className="text-gray-500">Spotify ID</h3>
                  <p>{profile.spotify_id}</p>
                </div>
                <div>
                  <h3 className="text-gray-500">Account Type</h3>
                  <p>{profile.account_type || "Standard"}</p>
                </div>
                <div>
                  <h3 className="text-gray-500">Country</h3>
                  <p>{profile.country || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
