import MangaList from "@/components/manga-list";
import MangaListSkeleton from "@/components/manga-list-skeleton";
import { fetchMangaDetails } from "@/lib/fetchers";
import { Suspense } from "react";

async function getMangaList() {
  const ONESHOT_MANGAS_IDS = [
    "2e2a0b88-32f9-4f59-a46c-f71066e4bcbd", // Spring Returns to AOI's room
    "50eda248-d8a6-4a49-9af2-f4feab4b082c", // Daisuki na Tsuma Datta
    "566ab917-4893-423a-8b0c-787ba77b6def", // Toki Doki
  ];

  const mangaList = await Promise.all(
    ONESHOT_MANGAS_IDS.map((id) => fetchMangaDetails(id))
  );

  return mangaList;
}

export default function Home() {
  const mangaPromise = getMangaList();

  return (
    <div>
      <Suspense fallback={<MangaListSkeleton />}>
        <MangaList mangaListPromise={mangaPromise} />
      </Suspense>
    </div>
  );
}
