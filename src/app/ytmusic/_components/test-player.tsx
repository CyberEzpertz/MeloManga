"use client";

import PlayerBar from "@/components/player-bar";
import { Button } from "@/components/ui/button";
import { getRecommendedURLs } from "@/lib/fetchers";
import { useState } from "react";

interface Props {
  songsPromise: ReturnType<typeof getRecommendedURLs>;
}
export default function TestPlayer({ songsPromise }: Props) {
  const [page, setPage] = useState(0);
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex flex-row gap-4">
        <Button onClick={() => setPage(page - 1)} disabled={page === 0}>
          Previous
        </Button>
        <Button onClick={() => setPage(page + 1)}>Next</Button>
      </div>
      <div className="mt-4">
        <p>Current Page: {page}</p>
      </div>
      <PlayerBar
        currentPage={page}
        songsPromise={songsPromise}
        setPage={setPage}
      />
    </div>
  );
}
