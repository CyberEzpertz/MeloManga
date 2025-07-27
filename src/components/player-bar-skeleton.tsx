import { Skeleton } from "./ui/skeleton";

export default function PlayerBarSkeleton() {
  return (
    <div className="relative h-28 w-full">
      <div className="fixed inset-x-0 bottom-3 mx-auto">
        <div className="bg-card border-border m-4 flex animate-pulse flex-row items-center justify-between rounded-xl border p-4 shadow-lg">
          {/* Thumbnail */}
          <Skeleton className="size-8 flex-shrink-0 rounded-md" />

          {/* Title and Artist */}
          <div className="mx-4 flex flex-1 flex-col gap-2 leading-none">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>

          <div className="ml-auto inline-flex flex-shrink-0 items-center gap-4">
            {/* Controls */}
            <Skeleton className="size-9 rounded-full" /> {/* Play button */}
            <Skeleton className="size-9 rounded-full" /> {/* Volume button */}
            <Skeleton className="size-9 rounded-full" /> {/* Queue button */}
          </div>
        </div>
      </div>
    </div>
  );
}
