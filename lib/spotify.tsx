import { createClient } from "@/utils/supabase/server";

const REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function initializeOrUpdateSpotifyData(
  userId: string,
  token: string
) {
  const supabase = createClient();

  try {
    const { data: userData, error: userError } = await supabase
      .from("user_spotify_data")
      .select("last_updated")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user data:", userError);
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    const shouldUpdate =
      !userData ||
      Date.now() - new Date(userData.last_updated).getTime() > REFRESH_INTERVAL;

    if (shouldUpdate) {
      console.log("Fetching new Spotify data for user:", userId);

      let topTracks, topArtists;
      try {
        topTracks = await fetchTopTracks(token);
        topArtists = await fetchTopArtists(token);
      } catch (fetchError) {
        console.error("Error fetching Spotify data:", fetchError);
        throw new Error(`Failed to fetch Spotify data: ${fetchError.message}`);
      }

      try {
        await storeSpotifyDataInSupabase(
          userId,
          topTracks.items,
          topArtists.items
        );
      } catch (storeError) {
        console.error("Error storing Spotify data:", storeError);
        throw new Error(`Failed to store Spotify data: ${storeError.message}`);
      }

      const { error: updateError } = await supabase
        .from("user_spotify_data")
        .upsert({ user_id: userId, last_updated: new Date().toISOString() });

      if (updateError) {
        console.error("Error updating last_updated timestamp:", updateError);
        throw new Error(
          `Failed to update last_updated timestamp: ${updateError.message}`
        );
      }

      console.log("Spotify data updated for user:", userId);
      return true;
    }

    console.log("No update needed for user:", userId);
    return false;
  } catch (error) {
    console.error("Error in initializeOrUpdateSpotifyData:", error);
    throw error;
  }
}

async function fetchTopTracks(token: string) {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw new Error(`Failed to fetch top tracks: ${error.message}`);
  }
}

async function fetchTopArtists(token: string) {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching top artists:", error);
    throw new Error(`Failed to fetch top artists: ${error.message}`);
  }
}

async function storeSpotifyDataInSupabase(
  userId: string,
  tracksData: any[],
  artistsData: any[]
) {
  const supabase = createClient();

  try {
    const { error: tracksError } = await supabase
      .from("user_top_tracks")
      .upsert(
        tracksData.map((track) => ({
          user_id: userId,
          track_id: track.id,
          name: track.name,
          album: track.album.name,
          artists: track.artists.map((artist: any) => artist.name),
          release_date: track.album.release_date,
          popularity: track.popularity,
          image_url: track.album.images[0]?.url,
        })),
        { onConflict: "user_id,track_id" }
      );

    if (tracksError) {
      console.error("Error inserting tracks data:", tracksError);
      throw new Error(`Failed to insert tracks data: ${tracksError.message}`);
    }

    const { error: artistsError } = await supabase
      .from("user_top_artists")
      .upsert(
        artistsData.map((artist) => ({
          user_id: userId,
          artist_id: artist.id,
          name: artist.name,
          genres: artist.genres,
          followers: artist.followers.total,
          image_url: artist.images[0]?.url,
        })),
        { onConflict: "user_id,artist_id" }
      );

    if (artistsError) {
      console.error("Error inserting artists data:", artistsError);
      throw new Error(`Failed to insert artists data: ${artistsError.message}`);
    }
  } catch (error) {
    console.error("Error in storeSpotifyDataInSupabase:", error);
    throw error;
  }
}
