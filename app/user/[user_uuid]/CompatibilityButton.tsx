// app/user/[user_uuid]/CompatibilityButton.tsx

"use client";
import React, { useState } from "react";
import { calculateCompatibility } from "@/app/actions";

interface CompatibilityButtonProps {
  currentUserId: string;
  profileUserId: string;
  initialCompatibilityData: any;
}

export default function CompatibilityButton({
  currentUserId,
  profileUserId,
  initialCompatibilityData,
}: CompatibilityButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [compatibilityData, setCompatibilityData] = useState(
    initialCompatibilityData
  );

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const data = await calculateCompatibility(currentUserId, profileUserId);
      setCompatibilityData(data);
    } catch (error) {
      console.error("Error calculating compatibility:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (compatibilityData) {
    const percentageScore = (
      compatibilityData.compatibility_score * 10
    ).toFixed(2);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Music Compatibility</h2>
        <p className="text-3xl font-bold text-indigo-600 mb-4">
          {percentageScore}%
        </p>
        <p className="text-sm text-gray-600 mb-4">
          (Score: {compatibilityData.compatibility_score.toFixed(2)} out of 10)
        </p>

        {compatibilityData.shared_tracks &&
          compatibilityData.shared_tracks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mt-4 mb-2">
                Shared Top Tracks
              </h3>
              <ul className="list-disc pl-5">
                {compatibilityData.shared_tracks.map((track: any) => (
                  <li key={track.id} className="mb-1">
                    {track.name} (You: #{track.your_rank}, They: #
                    {track.their_rank})
                  </li>
                ))}
              </ul>
            </div>
          )}

        {compatibilityData.shared_artists &&
          compatibilityData.shared_artists.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mt-4 mb-2">
                Shared Top Artists
              </h3>
              <ul className="list-disc pl-5">
                {compatibilityData.shared_artists.map((artist: any) => (
                  <li key={artist.id} className="mb-1">
                    {artist.name} (You: #{artist.your_rank}, They: #
                    {artist.their_rank})
                  </li>
                ))}
              </ul>
            </div>
          )}

        {compatibilityData.shared_genres &&
          compatibilityData.shared_genres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mt-4 mb-2">
                Shared Top Genres
              </h3>
              <ul className="list-disc pl-5">
                {compatibilityData.shared_genres.map((genre: any) => (
                  <li key={genre.name} className="mb-1">
                    {genre.name} (You: #{genre.your_rank}, They: #
                    {genre.their_rank})
                  </li>
                ))}
              </ul>
            </div>
          )}

        {(!compatibilityData.shared_tracks ||
          compatibilityData.shared_tracks.length === 0) &&
          (!compatibilityData.shared_artists ||
            compatibilityData.shared_artists.length === 0) &&
          (!compatibilityData.shared_genres ||
            compatibilityData.shared_genres.length === 0) && (
            <p className="text-gray-600">
              No shared tracks, artists, or genres found.
            </p>
          )}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300"
    >
      {isLoading ? "Calculating..." : "Calculate Compatibility"}
    </button>
  );
}
