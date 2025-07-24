"use server";

import { getRecommendedURLs } from "@/lib/fetchers";

export async function getRecommendedMusic(chapterId: string) {
  return await getRecommendedURLs(chapterId);
}
