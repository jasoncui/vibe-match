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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user_uuid)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile data:", error?.message);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="bg-indigo-900 h-32 relative">
          <div className="absolute -bottom-16 left-8">
            <Image
              src={profile.avatar_url || "/profile-placeholder.jpg"}
              alt="Profile Picture"
              width={120}
              height={120}
              className="rounded-full border-4 border-white"
            />
          </div>
        </div>
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
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
              <button className="px-2 py-2 border border-gray-300 rounded-full hover:bg-gray-100">
                •••
              </button>
            </div>
          </div>
          <p className="text-gray-700 mb-6">
            {profile.bio || "No bio available"}
          </p>
          <div className="flex space-x-4 text-sm text-gray-500 mb-6">
            <span>{profile.location || "Location"}</span>
            <span>
              Joined{" "}
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h2 className="text-xl font-semibold mb-4">Spotify Information</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
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

          <h2 className="text-xl font-semibold mb-4">Music Taste</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {["Pop", "Rock", "Hip Hop", "Electronic", "Classical"].map(
              (genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                >
                  {genre}
                </span>
              )
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
              <span>Listened to "Song Name" by Artist</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
              <span>Created new playlist "My Favorites"</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
              <span>Followed Artist Name</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
