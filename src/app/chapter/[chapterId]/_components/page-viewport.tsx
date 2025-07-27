"use client";

import { getRecommendedMusic } from "@/actions/recommendations";
import PlayerBar from "@/components/player-bar";
import { Button } from "@/components/ui/button";
import { getRecommendedURLs } from "@/lib/fetchers";
import { ChevronLeft, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, use, useState } from "react";

interface PageViewportProps {
  chapterId: string;
  imagesPromise: Promise<string[]>;
  songsPromise: ReturnType<typeof getRecommendedURLs>;
}

export default function PageViewport({
  chapterId,
  imagesPromise,
  songsPromise,
}: PageViewportProps) {
  const images = use(imagesPromise);

  const [page, setPage] = useState(0);
  const router = useRouter();

  const handleClick = async () => {
    const recommended = await getRecommendedMusic(chapterId);
    console.log("Recommended music:", recommended);
  };

  const handleBack = () => {
    router.back();
  };

  const handlePage = (direction: "next" | "prev") => {
    if (direction === "next" && page < images.length - 1) {
      setPage((prev) => prev + 1);
    } else if (direction === "prev" && page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const url = images[page] || "";

  return (
    <div className="flex h-screen max-h-screen w-full flex-col items-center">
      <div className="flex w-full flex-row items-center justify-between p-4">
        <Button
          className="rounded-full"
          size="icon"
          variant="ghost"
          onClick={handleBack}
        >
          <ChevronLeft className="size-4 text-blue-500" />
        </Button>
        <h1 className="font-semibold">
          {page + 1} / {images.length}
        </h1>
        <Button className="rounded-full" size="icon" variant="ghost">
          <Settings2 className="size-4" />
        </Button>
      </div>
      <div className="relative flex min-h-0 flex-1 self-stretch">
        {/* Tap Zones */}
        <div className="absolute flex h-full w-full flex-row">
          <div
            className="h-full w-2/5 cursor-pointer"
            onClick={() => handlePage("prev")}
          />
          <div
            className="ml-auto h-full w-2/5 cursor-pointer"
            onClick={() => handlePage("next")}
          />
        </div>

        {/* Image */}
        <div className="mx-auto my-auto flex max-h-full min-h-0">
          <img src={url} alt={`Page ${page}`} className="object-contain" />
        </div>
      </div>
      {images.length === 0 && <p>No images found.</p>}

      <Suspense fallback={<div>Loading music...</div>}>
        <PlayerBar currentPage={page + 1} songsPromise={songsPromise} />
      </Suspense>

      {/* Progress Bar */}
      <div className="fixed right-0 bottom-0 left-0 h-1.5 bg-zinc-200">
        <div
          className="h-full border border-blue-600 bg-blue-500 transition-all duration-300"
          style={{ width: `${((page + 1) / images.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
