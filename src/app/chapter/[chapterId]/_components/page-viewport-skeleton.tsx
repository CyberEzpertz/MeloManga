import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function PageViewportSkeleton() {
  return (
    <div className="flex h-screen max-h-screen w-full flex-col items-center">
      <div className="border-border flex w-full flex-row items-center justify-between border-b px-4 py-2">
        <Button className="rounded-full" size="icon" variant="ghost">
          <ChevronLeft className="size-4 text-blue-500" />
        </Button>
        <Skeleton className="h-5 w-16" />
        <ThemeToggle />
      </div>
      <div className="relative flex min-h-0 flex-1 self-stretch">
        {/* Image */}
        <div className="mx-auto my-auto flex max-h-full min-h-0">
          <Skeleton className="aspect-[3/4] h-[85vh]" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed right-0 bottom-0 left-0 h-1.5 bg-zinc-200">
        <Skeleton className="h-full w-1/3" />
      </div>
    </div>
  );
}
