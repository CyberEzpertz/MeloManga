import { Manga } from "@/lib/types";
import { BookAudio } from "lucide-react";
import { use } from "react";
import MangaCard from "./manga-card";
import { ThemeToggle } from "./theme-toggle";

interface MangaListProps {
  mangaListPromise: Promise<Manga[]>;
}
export default function MangaList({ mangaListPromise }: MangaListProps) {
  const mangaList = use(mangaListPromise);

  return (
    <div className="flex h-screen max-h-screen w-full flex-col items-stretch">
      <div className="flex w-full flex-row items-center justify-between p-4">
        <BookAudio className="text-primary-foreground size-4" />
        <span className="font-bold">Your Library</span>
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-row flex-wrap gap-4 p-4">
        {mangaList.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>
    </div>
  );
}
