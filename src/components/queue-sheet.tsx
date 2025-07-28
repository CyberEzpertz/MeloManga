"use client";

import { ListMusic } from "lucide-react";
import { useState } from "react";
import { MusicSegment } from "./player-bar";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface QueueSheetProps {
  songs: MusicSegment[];
  currentSong: string | null;
  setPage: (page: number) => void;
}

export function QueueSheet({ songs, currentSong, setPage }: QueueSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <ListMusic className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm">
        <SheetHeader>
          <SheetTitle>Current Queue</SheetTitle>
          <SheetDescription>
            Here are the tracks for this manga.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 p-4 pt-0">
          {songs.map((song) => (
            <div
              key={song.src}
              className={`hover:border-primary flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                currentSong === song.src
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
              onClick={() => {
                setPage(song.start - 1); // Adjust page to zero-based index
                setOpen(false);
              }}
            >
              {/* Thumbnail */}
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                <img
                  src={song.thumbnailUrl || "/placeholder.png"}
                  alt={song.title || "Music"}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Song Info */}
              <div className="flex flex-1 flex-col">
                <p className="font-medium">{song.title || "Unknown Title"}</p>
                <p className="text-muted-foreground text-sm">
                  {song.artist || "Unknown Artist"}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Pages {song.start} - {song.end}
                </p>
              </div>

              {/* Active Indicator */}
              {currentSong === song.src && (
                <div className="text-primary ml-2 text-sm font-medium">
                  Playing
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
