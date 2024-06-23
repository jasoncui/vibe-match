// app/user/[user_uuid]/CompatibilityButton.tsx

"use client";

import { useState } from "react";
import { calculateCompatibility } from "@/app/actions";

interface CompatibilityButtonProps {
  currentUserId: string;
  profileUserId: string;
  initialCompatibilityData: any | null;
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
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  if (compatibilityData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Music Compatibility</h2>
        <p className="text-3xl font-bold text-indigo-600 mb-4">
          {(compatibilityData.compatibility_score * 100).toFixed(2)}%
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Shared Top Tracks</h3>
        <ul>
          {compatibilityData.shared_tracks.map((track: any) => (
            <li key={track.id}>
              {track.name} (You: #{track.your_rank}, They: #{track.their_rank})
            </li>
          ))}
        </ul>

        {/* Similar sections for shared artists and genres */}
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
