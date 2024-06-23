// lib/compatibility.ts

import { createClient } from "@/utils/supabase/server";

interface SharedItem {
  id: string;
  name: string;
  your_rank: number;
  their_rank: number;
}

interface ComparisonResult {
  score: number;
  shared: SharedItem[];
}

export async function calculateAndStoreCompatibility(
  userId1: string,
  userId2: string
) {
  const supabase = createClient();

  const tracksData = await compareTopTracks(userId1, userId2);
  const artistsData = await compareTopArtists(userId1, userId2);
  const genresData = await compareTopGenres(userId1, userId2);

  const compatibilityScore =
    0.3 * tracksData.score + 0.4 * artistsData.score + 0.3 * genresData.score;

  // Ensure consistent ordering of user IDs
  const [smallerId, largerId] = [userId1, userId2].sort();

  // Store the data
  const { data, error } = await supabase.from("user_compatibility").upsert(
    {
      user_id_1: smallerId,
      user_id_2: largerId,
      compatibility_score: compatibilityScore,
      shared_tracks: tracksData.shared,
      shared_artists: artistsData.shared,
      shared_genres: genresData.shared,
      last_updated: new Date().toISOString(),
    },
    { onConflict: "user_id_1,user_id_2" }
  );

  if (error) {
    console.error("Error storing compatibility data:", error);
    throw error;
  }

  return {
    compatibility_score: compatibilityScore,
    shared_tracks: tracksData.shared,
    shared_artists: artistsData.shared,
    shared_genres: genresData.shared,
  };
}

async function compareTopTracks(
  userId1: string,
  userId2: string
): Promise<ComparisonResult> {
  const supabase = createClient();

  const { data: tracks1, error: error1 } = await supabase
    .from("user_top_tracks")
    .select("*")
    .eq("user_id", userId1)
    .order("rank", { ascending: true });

  const { data: tracks2, error: error2 } = await supabase
    .from("user_top_tracks")
    .select("*")
    .eq("user_id", userId2)
    .order("rank", { ascending: true });

  if (error1 || error2) {
    console.error("Error fetching tracks:", error1 || error2);
    throw error1 || error2;
  }

  const sharedTracks: SharedItem[] = [];
  const trackMap = new Map(tracks2.map((track) => [track.track_id, track]));

  tracks1.forEach((track1) => {
    const track2 = trackMap.get(track1.track_id);
    if (track2) {
      sharedTracks.push({
        id: track1.track_id,
        name: track1.name,
        your_rank: track1.rank,
        their_rank: track2.rank,
      });
    }
  });

  const maxTracks = Math.max(tracks1.length, tracks2.length);
  const sharedTrackScore = sharedTracks.reduce((sum, track) => {
    const rankScore =
      (maxTracks - Math.abs(track.your_rank - track.their_rank)) / maxTracks;
    return sum + rankScore;
  }, 0);

  const score =
    sharedTracks.length > 0 ? (sharedTrackScore / maxTracks) * 100 : 0;

  return { score, shared: sharedTracks };
}

async function compareTopArtists(
  userId1: string,
  userId2: string
): Promise<ComparisonResult> {
  const supabase = createClient();

  const { data: artists1, error: error1 } = await supabase
    .from("user_top_artists")
    .select("*")
    .eq("user_id", userId1)
    .order("rank", { ascending: true });

  const { data: artists2, error: error2 } = await supabase
    .from("user_top_artists")
    .select("*")
    .eq("user_id", userId2)
    .order("rank", { ascending: true });

  if (error1 || error2) {
    console.error("Error fetching artists:", error1 || error2);
    throw error1 || error2;
  }

  const sharedArtists: SharedItem[] = [];
  const artistMap = new Map(
    artists2.map((artist) => [artist.artist_id, artist])
  );

  artists1.forEach((artist1) => {
    const artist2 = artistMap.get(artist1.artist_id);
    if (artist2) {
      sharedArtists.push({
        id: artist1.artist_id,
        name: artist1.name,
        your_rank: artist1.rank,
        their_rank: artist2.rank,
      });
    }
  });

  const maxArtists = Math.max(artists1.length, artists2.length);
  const sharedArtistScore = sharedArtists.reduce((sum, artist) => {
    const rankScore =
      (maxArtists - Math.abs(artist.your_rank - artist.their_rank)) /
      maxArtists;
    return sum + rankScore;
  }, 0);

  const score =
    sharedArtists.length > 0 ? (sharedArtistScore / maxArtists) * 100 : 0;

  return { score, shared: sharedArtists };
}

async function compareTopGenres(
  userId1: string,
  userId2: string
): Promise<ComparisonResult> {
  const supabase = createClient();

  const { data: genres1, error: error1 } = await supabase
    .from("user_top_genres")
    .select("*")
    .eq("user_id", userId1)
    .order("rank", { ascending: true });

  const { data: genres2, error: error2 } = await supabase
    .from("user_top_genres")
    .select("*")
    .eq("user_id", userId2)
    .order("rank", { ascending: true });

  if (error1 || error2) {
    console.error("Error fetching genres:", error1 || error2);
    throw error1 || error2;
  }

  const sharedGenres: SharedItem[] = [];
  const genreMap = new Map(genres2.map((genre) => [genre.genre, genre]));

  genres1.forEach((genre1) => {
    const genre2 = genreMap.get(genre1.genre);
    if (genre2) {
      sharedGenres.push({
        id: genre1.genre,
        name: genre1.genre,
        your_rank: genre1.rank,
        their_rank: genre2.rank,
      });
    }
  });

  const maxGenres = Math.max(genres1.length, genres2.length);
  const sharedGenreScore = sharedGenres.reduce((sum, genre) => {
    const rankScore =
      (maxGenres - Math.abs(genre.your_rank - genre.their_rank)) / maxGenres;
    return sum + rankScore;
  }, 0);

  const score =
    sharedGenres.length > 0 ? (sharedGenreScore / maxGenres) * 100 : 0;

  return { score, shared: sharedGenres };
}

export async function getCompatibilityData(userId1: string, userId2: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_compatibility")
    .select("*")
    .or(
      `and(user_id_1.eq.${userId1},user_id_2.eq.${userId2}),and(user_id_1.eq.${userId2},user_id_2.eq.${userId1})`
    )
    .order("last_updated", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching compatibility data:", error);
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function doesCompatibilityExist(
  userId1: string,
  userId2: string
): Promise<boolean> {
  const data = await getCompatibilityData(userId1, userId2);
  return !!data;
}
