// app/actions.ts

"use server";

import {
  calculateAndStoreCompatibility,
  getCompatibilityData,
} from "@/lib/compatibility";

export async function calculateCompatibility(
  currentUserId: string,
  profileUserId: string
) {
  let compatibilityData = await getCompatibilityData(
    currentUserId,
    profileUserId
  );

  if (!compatibilityData) {
    // No existing data, so we need to calculate it
    compatibilityData = await calculateAndStoreCompatibility(
      currentUserId,
      profileUserId
    );
  }

  return compatibilityData;
}
