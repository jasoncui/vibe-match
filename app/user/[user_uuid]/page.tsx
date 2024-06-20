import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BellIcon, SunIcon } from "@heroicons/react/24/outline";

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

  const avatarUrl = profile.avatar_url || "/profile-placeholder.jpg";
  const username = profile.username || "User";

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-blue-600">
              Edit Profile
            </h1>
            <div className="flex space-x-4">
              <SunIcon className="h-6 w-6 text-blue-500" />
              <BellIcon className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="flex items-center mb-8">
            <div className="relative">
              <Image
                src={avatarUrl}
                alt="Profile Picture"
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-bold">{username}</h2>
              <p className="text-gray-500">Last activity 10:35</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {["Balance", "Deposits", "Withdraws"].map((label) => (
              <div key={label} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <p className="text-2xl font-bold text-gray-800">$0</p>
                <p className="text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <ul className="space-y-4">
              {[
                "Personal Info",
                "Credit Cards",
                "Transactions Summary",
                "Security & Privacy",
              ].map((action) => (
                <li
                  key={action}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150"
                >
                  <span>{action}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
