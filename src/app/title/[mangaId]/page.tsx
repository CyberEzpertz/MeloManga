//sample: http://localhost:3000/title/2750ed89-ea66-4c0c-ab05-7417a9e0de3e

import { fetchMangaChapters, fetchMangaDetails } from "@/lib/fetchers";
import { Suspense } from "react";
import MangaViewport from "./_components/manga-viewport";
import MangaViewportSkeleton from "./_components/manga-viewport-skeleton";

export default async function MangaIdPage({
  params,
}: {
  params: Promise<{ mangaId: string }>;
}) {
  const { mangaId } = await params;

  const detailsPromise = fetchMangaDetails(mangaId);
  const chaptersPromise = fetchMangaChapters(mangaId);

  return (
    <Suspense fallback={<MangaViewportSkeleton />}>
      <MangaViewport
        mangaId={mangaId}
        detailsPromise={detailsPromise}
        chaptersPromise={chaptersPromise}
      />
    </Suspense>
  );
}
