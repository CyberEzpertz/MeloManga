"use client";

import { useEffect, useRef, useState } from "react";

import { Pause, Play } from "lucide-react";
import ReactPlayer from "react-player";

import { Button } from "./ui/button";

interface MusicSegments {
  src: string;
  start: number;
}

interface PlayerProps {
  currentPage: number;
  sources: MusicSegments[];
}

export default function PlayerBar({ sources, currentPage }: PlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    src: string;
    volume: number;
  }>({
    src: sources[0]?.src || "",
    volume: 1,
  });
  const [nextTrack, setNextTrack] = useState<{ src: string; volume: number }>({
    src: "",
    volume: 0,
  });
  const crossfadeDuration = 3000; // Duration of crossfade in milliseconds
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startCrossfade = (newSrc: string) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start with current track at full volume and new track at zero
    setNextTrack({ src: newSrc, volume: 0 });
    startTimeRef.current = performance.now();

    const fade = (currentTime: DOMHighResTimeStamp) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / crossfadeDuration, 1);

      // Fade out current track while fading in next track
      setCurrentTrack((prev) => ({ ...prev, volume: 1 - progress }));
      setNextTrack((prev) => ({ ...prev, volume: progress }));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(fade);
      } else {
        // Crossfade complete - make next track the current track
        setCurrentTrack({
          src: newSrc,
          volume: 1,
        });
        setNextTrack({
          src: "",
          volume: 0,
        });
      }
    };

    animationRef.current = requestAnimationFrame(fade);
  };

  const onPlayButtonClick = () => {
    setPlaying(!playing);
  };

  // Effect to handle track changes based on page number
  useEffect(() => {
    const currentSource = sources.find((s) => currentPage >= s.start);
    if (currentSource && currentSource.src !== currentTrack.src) {
      startCrossfade(currentSource.src);
    }
  }, [currentPage, sources, currentTrack.src]);

  return (
    <div className="relative">
      {/* Current track player */}
      <ReactPlayer
        src={currentTrack.src}
        style={{ display: "none" }}
        playing={playing}
        volume={currentTrack.volume}
        muted={false}
      />
      {/* Next track player for crossfade */}
      {nextTrack.src && (
        <ReactPlayer
          src={nextTrack.src}
          style={{ display: "none" }}
          playing={playing}
          volume={nextTrack.volume}
          muted={false}
        />
      )}
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
