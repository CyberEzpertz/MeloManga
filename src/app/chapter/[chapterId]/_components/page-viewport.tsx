"use client";

import { getRecommendedMusic } from "@/actions/recommendations";
import { Button } from "@/components/ui/button";
import { moodToSeedSongs } from "@/lib/moods";
import { getSongsFeatures } from "@/lib/reccobeats";
import { use } from "react";

interface PageViewportProps {
  chapterId: string;
  imagesPromise: Promise<string[]>;
  // songsPromise: ReturnType<typeof getRecommendedURLs>;
}

export default function PageViewport({
  chapterId,
  imagesPromise,
  // songsPromise,
}: PageViewportProps) {
  const images = use(imagesPromise);
  // const songs = use(songsPromise);

  // for (const song of songs) {
  //   console.log(
  //     `Song from ${song.start} to ${song.end}: Mood - ${song.mood}, Confidence - ${song.confidence}`
  //   );
  //   console.log(`Recommendations: ${song.recommendations.join(", ")}`);
  // }

  const handleClick = async () => {
    const recommended = await getRecommendedMusic(chapterId);

    for (const song of recommended) {
      console.log(
        `Song from ${song.start} to ${song.end}: Mood - ${song.moodDescription} (${song.moodCategory}), Confidence - ${song.confidence}`
      );
      console.log("Recommendations:", song.recommendations);
    }
  };

  const handleMoodSongs = async () => {
    const songs = await getSongsFeatures(moodToSeedSongs["action"]);

    songs.map((song) => {
      console.log(song);
    });
  };

  return (
    <div className="flex w-screen flex-col items-center p-4">
      <h1 className="text-2xl font-semibold">Chapter: {chapterId}</h1>
      <Button onClick={handleClick}>Generate Music</Button>
      <Button onClick={handleMoodSongs}>Get Mood Songs</Button>
      <div className="mx-auto mt-2 flex flex-col gap-4">
        <div className="max-w-xl">
          {images.map((url, i) => (
            <img key={i} src={url} alt={`Page ${i + 1}`} className="w-full" />
          ))}
        </div>
      </div>
      {images.length === 0 && <p>No images found.</p>}
    </div>
  );
}
