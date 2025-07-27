import { BookAudio } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Skeleton } from "./ui/skeleton";

export default function MangaListSkeleton() {
  return (
    <div className="flex h-screen max-h-screen w-full flex-col items-stretch">
      <div className="flex w-full flex-row items-center justify-between p-4">
        <BookAudio className="text-primary-foreground size-4" />
        <span className="font-bold">Your Library</span>
        <ThemeToggle />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
