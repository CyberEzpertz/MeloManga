//sample: http://localhost:3000/chapter/157282a2-d627-45ac-ab3a-8a7769a5945b

import { getChapterImages, getRecommendedURLs } from "@/lib/fetchers";
import { Suspense } from "react";
import PageViewport from "./_components/page-viewport";

export default async function ChapterIdPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;

  const imagesPromise = getChapterImages(chapterId);
  const songsPromise = getRecommendedURLs(chapterId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageViewport
        chapterId={chapterId}
        imagesPromise={imagesPromise}
        songsPromise={songsPromise}
      />
    </Suspense>
  );
}
