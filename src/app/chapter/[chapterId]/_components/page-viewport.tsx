"use client";

import { use } from "react";

interface PageViewportProps {
  chapterId: string;
  imagesPromise: Promise<string[]>;
}

export default function PageViewport({
  chapterId,
  imagesPromise,
}: PageViewportProps) {
  const images = use(imagesPromise);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Chapter: {chapterId}</h1>
      <div className="grid gap-4">
        {images.map((url, i) => (
          <img key={i} src={url} alt={`Page ${i + 1}`} className="w-full" />
        ))}
      </div>
      {images.length === 0 && <p>No images found.</p>}
    </div>
  );
}
