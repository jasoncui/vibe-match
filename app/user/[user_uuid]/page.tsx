import React from "react";
import { createClient } from "@/utils/supabase/server";

interface UserProfileProps {
  userUuid: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userUuid }) => {
  const supabaseClient = createClient();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
        <div className="flex items-center justify-center mb-6">
          <img
            src="/profile-placeholder.jpg"
            alt="Profile Picture"
            className="rounded-full h-24 w-24 object-cover"
          />
        </div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">John Doe</h2>
          <p className="text-gray-600">@johndoe</p>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Bio</h3>
          <p className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor,
            magna vel luctus tempor, enim velit volutpat nisi, vel dictum sapien
            velit sed eros.
          </p>
        </div>
        <div className="flex justify-center">
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
