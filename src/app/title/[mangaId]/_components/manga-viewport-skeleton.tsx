import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function MangaViewportSkeleton() {
  return (
    <div>
      <div className="border-border flex w-full flex-row items-center justify-between border-b px-4 py-2">
        <Button className="rounded-full" size="icon" variant="ghost">
          <ChevronLeft className="size-4 text-blue-500" />
        </Button>
        <ThemeToggle />
      </div>
      {/* Desktop View */}
      <div className="hidden flex-col p-6 md:flex">
        <div className="flex flex-col gap-8">
          <div className="flex gap-8">
            <Skeleton className="h-96 w-64 rounded-xl" />
            <div className="flex flex-1 flex-col gap-6">
              <Skeleton className="h-9 w-2/3" />
              <div>
                <Skeleton className="mb-2 h-4 w-20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="mt-4 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-20" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-24 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Skeleton className="mb-4 h-4 w-24" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-36" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex flex-col items-stretch justify-center md:hidden">
        <div className="w-full">
          <Skeleton className="h-[70vh] w-full" />
        </div>
        <div className="bg-background z-10 -mt-8 flex w-full flex-col gap-8 rounded-t-4xl p-8 shadow-2xl">
          <Skeleton className="h-8 w-3/4" />
          <div>
            <Skeleton className="mb-2 h-4 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="border-border flex w-full flex-row justify-between border-t py-4"
                >
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-40" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-9 w-36" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
