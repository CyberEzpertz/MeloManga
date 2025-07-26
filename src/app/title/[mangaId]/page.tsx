//sample: http://localhost:3000/title/2750ed89-ea66-4c0c-ab05-7417a9e0de3e

import { fetchMangaDetails, fetchMangaChapters } from "@/lib/fetchers";
import { Suspense } from "react";
import MangaViewport from "./_components/manga-viewport";

export default async function MangaIdPage({
  params,
}: {
  params: Promise<{ mangaId: string }>;
}) {
  const { mangaId } = await params;

  const detailsPromise = fetchMangaDetails(mangaId);
  const chaptersPromise = fetchMangaChapters(mangaId);

  return (
    <Suspense fallback={<div>Loading manga details...</div>}>
      <MangaViewport
        mangaId={mangaId}
        detailsPromise={detailsPromise}
        chaptersPromise={chaptersPromise}
      />
    </Suspense>
  );
}