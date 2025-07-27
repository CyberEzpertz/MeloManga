"use client";

import { use, useEffect, useRef, useState } from "react";

import { Pause, Play } from "lucide-react";
import ReactPlayer from "react-player";

import { getRecommendedURLs } from "@/lib/fetchers";
import { Button } from "./ui/button";

export interface MusicSegment {
  src: string;
  start: number;
  end: number;
}

interface PlayerProps {
  currentPage: number;
  songsPromise: ReturnType<typeof getRecommendedURLs>;
}

export default function PlayerBar({ currentPage, songsPromise }: PlayerProps) {
  const sources = use(songsPromise);
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    src: string | null;
    volume: number;
  }>({
    src: sources[0]?.src || null,
    volume: 1,
  });
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);

  const fadeOutDuration = 3000; // 3 seconds fade out
  const fadeInDuration = 6000; // 6 seconds fade in
  const delayDuration = 1000; // 1000ms delay before fade in
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
        const progress = Math.min(elapsed / fadeOutDuration, 1);
        setCurrentTrack((prev) => ({
          ...prev,
          volume: Math.max(0, 1 - progress),
        }));

        if (progress >= 1) {
          // Switch to delay phase
          fadePhaseRef.current = "delay";
          startTimeRef.current = currentTime;
          setCurrentTrack({
            src: newSrc,
            volume: 0,
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
        const progress = Math.min(elapsed / fadeInDuration, 1);
        setCurrentTrack((prev) => ({
          ...prev,
          volume: Math.min(1, progress),
        }));

        if (progress >= 1) {
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
    <div className="relative">
      <code>
        {JSON.stringify({ current: currentTrack, next: nextSrc })} {playing}
      </code>
      <ReactPlayer
        src={currentTrack.src || undefined}
        playing={playing}
        volume={currentTrack.volume}
        controls={true}
      />
      <div className="fixed inset-x-0 mx-auto">
        <div className="m-4 flex flex-row rounded-xl bg-zinc-800 p-4">
          <Button className="h-8 w-8 p-1" asChild onClick={onPlayButtonClick}>
            {playing ? (
              <Pause fill="#EAF2FF" stroke="#EAF2FF" />
            ) : (
              <Play fill="#EAF2FF" stroke="#EAF2FF" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
