"use client";

import { use, useEffect, useRef, useState } from "react";

import { Pause, Play } from "lucide-react";
import ReactPlayer from "react-player";

import { getRecommendedURLs } from "@/lib/fetchers";
import { cn } from "@/lib/utils";
import { QueueSheet } from "./queue-sheet";
import { Button } from "./ui/button";
import VolumeControl from "./volume-control";

export interface MusicSegment {
  src: string;
  start: number;
  end: number;
  title?: string;
  thumbnailUrl?: string;
  artist?: string;
}

interface PlayerProps {
  currentPage: number;
  songsPromise: ReturnType<typeof getRecommendedURLs>;
  setPage: (page: number) => void;
}

export default function PlayerBar({
  currentPage,
  songsPromise,
  setPage,
}: PlayerProps) {
  const sources = use(songsPromise);
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    src: string | null;
    volume: number;
    title?: string;
    artist?: string;
    thumbnailUrl?: string;
  }>({
    src: sources[0]?.src || null,
    volume: 1,
    title: sources[0]?.title,
    artist: sources[0]?.artist,
    thumbnailUrl: sources[0]?.thumbnailUrl,
  });
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [manualVolume, setManualVolume] = useState<number>(1);

  const fadeOutDuration = 3000;
  const fadeInDuration = 5000;
  const delayDuration = 1000;
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const fadePhaseRef = useRef<"out" | "delay" | "in">("out");

  const startCrossfade = (newSrc: string) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setNextSrc(newSrc);
    startTimeRef.current = performance.now();
    fadePhaseRef.current = "out";
    setIsCrossfading(true);

    const fade = (currentTime: DOMHighResTimeStamp) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;

      if (fadePhaseRef.current === "out") {
        // Fade out current track
        const progress = Math.min(elapsed / fadeOutDuration, manualVolume);
        setCurrentTrack((prev) => ({
          ...prev,
          volume: Math.max(0, manualVolume - progress),
        }));

        if (progress >= manualVolume) {
          // Switch to delay phase
          fadePhaseRef.current = "delay";
          startTimeRef.current = currentTime;
          setCurrentTrack({
            src: newSrc,
            volume: 0,
            title: sources.find((s) => s.src === newSrc)?.title,
            artist: sources.find((s) => s.src === newSrc)?.artist,
            thumbnailUrl: sources.find((s) => s.src === newSrc)?.thumbnailUrl,
          });
        }
      } else if (fadePhaseRef.current === "delay") {
        if (elapsed >= delayDuration) {
          // Switch to fade in phase
          fadePhaseRef.current = "in";
          startTimeRef.current = currentTime;
        }
      } else {
        // Fade in phase (6 second duration)
        const progress = Math.min(elapsed / fadeInDuration, manualVolume);
        setCurrentTrack((prev) => ({
          ...prev,
          volume: Math.min(manualVolume, progress),
        }));

        if (progress >= manualVolume) {
          setIsCrossfading(false);
          setNextSrc(null);
          animationRef.current = null;
          return;
        }
      }

      animationRef.current = requestAnimationFrame(fade);
    };

    animationRef.current = requestAnimationFrame(fade);
  };

  const onPlayButtonClick = () => {
    setPlaying(!playing);
  };

  // Effect to handle track changes based on page number
  useEffect(() => {
    const currentSource = sources.find(
      (s) => currentPage >= s.start && currentPage <= s.end
    );
    if (
      currentSource &&
      currentSource.src !== currentTrack.src &&
      currentSource.src !== nextSrc &&
      !isCrossfading
    ) {
      console.log("Changing track to:", currentSource.src);
      startCrossfade(currentSource.src);
    }
  }, [currentPage, sources, currentTrack.src, nextSrc, isCrossfading]);

  return (
    <div className="relative h-28 w-full">
      <ReactPlayer
        src={currentTrack.src || undefined}
        style={{ display: "none" }}
        playing={playing}
        volume={currentTrack.volume}
        controls={true}
      />
      <div className="fixed inset-x-0 bottom-3 z-20 mx-auto">
        <div
          className={cn(
            "bg-card border-border m-4 flex flex-row items-center justify-between rounded-xl border p-4 shadow-lg",
            isCrossfading && fadePhaseRef.current === "out" && "animate-pulse"
          )}
        >
          {/* Thumbnail */}
          <div className="size-8 flex-shrink-0 overflow-hidden rounded-md">
            <img
              src={currentTrack.thumbnailUrl || "/placeholder.png"}
              alt={currentTrack.title || "Music"}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Title and Artist */}
          <div className="mx-4 flex flex-1 flex-col leading-none">
            <span className="text-foreground line-clamp-1 text-sm font-medium">
              {currentTrack.title || "Unknown Title"}
            </span>
            <span className="text-muted-foreground text-xs">
              {currentTrack.artist || "Unknown Artist"}
            </span>
          </div>

          <div className="ml-auto inline-flex flex-shrink-0 items-center gap-4">
            {/* Volume Control */}
            <Button
              className="rounded-full"
              variant="default"
              size="icon"
              onClick={onPlayButtonClick}
            >
              {playing ? (
                <Pause
                  className="text-primary-foreground h-5 w-5"
                  fill="currentColor"
                />
              ) : (
                <Play
                  className="text-primary-foreground h-5 w-5"
                  fill="currentColor"
                />
              )}
            </Button>
            <VolumeControl
              volume={manualVolume}
              onVolumeChange={(value) => {
                if (!isCrossfading) {
                  setCurrentTrack((prev) => ({ ...prev, volume: value }));
                  setManualVolume(value);
                }
              }}
              disabled={isCrossfading}
            />
            {/* Controls */}

            <QueueSheet
              songs={sources}
              currentSong={currentTrack.src}
              setPage={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
