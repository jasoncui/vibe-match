import { createClient } from "@/utils/supabase/server";

const REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function initializeOrUpdateSpotifyData(
  userId: string,
  token: string
) {
  const supabase = createClient();

  try {
    // Check if user data exists and when it was last updated
    const { data: userData, error: userError } = await supabase
      .from("user_spotify_data")
      .select("last_updated, basic_score")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError && userError.code !== "PGRST116") {
      console.error("Error fetching user data:", userError);
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    const shouldUpdate =
      !userData ||
      Date.now() - new Date(userData.last_updated).getTime() > REFRESH_INTERVAL;

    if (shouldUpdate) {
      console.log("Fetching new Spotify data for user:", userId);

      // Fetch new data from Spotify
      const topTracks = await fetchTopTracks(token);
      const topArtists = await fetchTopArtists(token);

      // Calculate basic score
      const basicScore = calculateBasicScore(topTracks.items);

      // Store the fetched data and basic score in Supabase
      await storeSpotifyDataInSupabase(
        userId,
        topTracks.items,
        topArtists.items,
        basicScore
      );

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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Error fetching top artists:", error);
    throw new Error(`Failed to fetch top artists: ${error.message}`);
  }
}

function calculateBasicScore(tracks: any[]): number | null {
  if (!tracks || tracks.length === 0) {
    console.log("No tracks available for basic score calculation");
    return null;
  }

  const validTracks = tracks.filter(
    (track) => typeof track.popularity === "number"
  );

  if (validTracks.length === 0) {
    console.log("No tracks with valid popularity scores");
    return null;
  }

  const totalPopularity = validTracks.reduce(
    (sum, track) => sum + track.popularity,
    0
  );
  const averagePopularity = totalPopularity / validTracks.length;

  console.log(
    `Calculated basic score: ${averagePopularity.toFixed(2)} from ${
      validTracks.length
    } tracks`
  );
  return averagePopularity;
}

async function storeSpotifyDataInSupabase(
  userId: string,
  tracksData: any[],
  artistsData: any[],
  basicScore: number | null
) {
  const supabase = createClient();

  try {
    // Store tracks data with ranking
    const { error: tracksError } = await supabase
      .from("user_top_tracks")
      .upsert(
        tracksData.map((track, index) => ({
          user_id: userId,
          track_id: track.id,
          name: track.name,
          album: track.album.name,
          artists: track.artists.map((artist: any) => artist.name),
          release_date: track.album.release_date,
          popularity: track.popularity,
          image_url: track.album.images[0]?.url,
          rank: index + 1, // Add ranking based on the order
        })),
        { onConflict: "user_id,track_id" }
      );

    if (tracksError) {
      console.error("Error inserting tracks data:", tracksError);
      throw new Error(`Failed to insert tracks data: ${tracksError.message}`);
    }

    // Store artists data with ranking
    const { error: artistsError } = await supabase
      .from("user_top_artists")
      .upsert(
        artistsData.map((artist, index) => ({
          user_id: userId,
          artist_id: artist.id,
          name: artist.name,
          genres: artist.genres,
          followers: artist.followers.total,
          image_url: artist.images[0]?.url,
          rank: index + 1, // Add ranking based on the order
        })),
        { onConflict: "user_id,artist_id" }
      );

    if (artistsError) {
      console.error("Error inserting artists data:", artistsError);
      throw new Error(`Failed to insert artists data: ${artistsError.message}`);
    }

    // Update basic score in user_spotify_data
    console.log(`Attempting to store basic score: ${basicScore}`);
    const { error: scoreError } = await supabase
      .from("user_spotify_data")
      .upsert({
        user_id: userId,
        basic_score: basicScore,
        last_updated: new Date().toISOString(),
      });

    if (scoreError) {
      console.error("Error updating basic score:", scoreError);
      throw new Error(`Failed to update basic score: ${scoreError.message}`);
    }

    console.log(`Stored basic score for user ${userId}: ${basicScore}`);
  } catch (error) {
    console.error("Error in storeSpotifyDataInSupabase:", error);
    throw error;
  }
}

export { fetchTopTracks, fetchTopArtists, calculateBasicScore };
