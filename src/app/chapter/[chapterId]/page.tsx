//sample: http://localhost:3000/chapter/157282a2-d627-45ac-ab3a-8a7769a5945b

import { getChapterImages, getRecommendedURLs } from "@/lib/fetchers";
import { Suspense } from "react";
import PageViewport from "./_components/page-viewport";

export default async function ChapterIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { chapterId } = await params;
  const withMusic = (await searchParams)["music"] === "true";

  const imagesPromise = getChapterImages(chapterId);
  const songsPromise = withMusic
    ? getRecommendedURLs(chapterId)
    : Promise.resolve([]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageViewport
        imagesPromise={imagesPromise}
        songsPromise={songsPromise}
        withMusic={withMusic}
      />
    </Suspense>
  );
}
