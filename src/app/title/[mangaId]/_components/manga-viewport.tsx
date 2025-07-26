"use client";

import { useEffect, useState } from "react";
import type { Manga, Chapter } from "@/lib/types";

export default function MangaViewport({
  mangaId,
  detailsPromise,
  chaptersPromise,
}: {
  mangaId: string;
  detailsPromise: Promise<Manga>;
  chaptersPromise: Promise<Chapter[]>;
}) {
  const [details, setDetails] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    detailsPromise.then(setDetails);
    chaptersPromise.then(setChapters);
  }, [detailsPromise, chaptersPromise]);

  if (!details) return <div>Loading manga...</div>;

  const enTitle = details.attributes.title["en"];
  const enDesc = details.attributes.description["en"] ?? "No description available.";
  const demographic = details.attributes.publicationDemographic ?? "Unknown";
  const status = details.attributes.status ?? "Unknown";

  const authorNames = details.relationships
    .filter((r) => r.type === "author" && r.attributes?.name).map((r) => r.attributes!.name).join(", ") || "Unknown";

  const artistNames = details.relationships
    .filter((r) => r.type === "artist" && r.attributes?.name).map((r) => r.attributes!.name).join(", ") || "Unknown";

  const tags = details.attributes.tags.map((tag) => tag.attributes.name["en"]);

  const coverFileName = details.relationships.find((r) => r.type === "cover_art")?.attributes?.fileName;
  const coverUrl = coverFileName
    ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}.256.jpg` : null;

  //full disclosure: I used chatGPT to help with the styling
    return (
        <div className="p-6 space-y-6">

        <div className="flex flex-col md:flex-row gap-6">
            {coverUrl && (
            <img
                src={coverUrl}
                alt="Cover Art"
                className="w-48 h-auto rounded shadow-md"
            />
            )}

        <div>
          <h1 className="text-3xl font-bold">{enTitle}</h1>
          <p className="text-gray-700 mt-2">{enDesc}</p>
          <p className="text-sm text-gray-600 mt-1">
            Author: {authorNames} &nbsp;|&nbsp; Artist: {artistNames}
          </p>
          <p className="text-sm text-gray-600">
            Status: {status} &nbsp;|&nbsp; Demographic: {demographic}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mt-4">Chapters</h2>
        {chapters.length === 0 ? (
          <p className="text-gray-600 text-sm mt-1">No chapters found.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {chapters.map((ch) => {
              const group = ch.relationships.find((r) => r.type === "scanlation_group")?.attributes?.name ?? "Unknown Group";
              const user = ch.relationships.find((r) => r.type === "user")?.attributes?.username ?? "Unknown Uploader";

              return (
                <li key={ch.id} className="text-sm">
                  <span className="font-medium">Ch. {ch.attributes.chapter || "?"}</span>:{" "}
                  {ch.attributes.title || "Untitled"}{" "}
                  <span className="text-gray-500 text-xs">({new Date(ch.attributes.publishAt).toLocaleDateString()})</span>{" "}
                  <span className="text-gray-400 text-xs ml-1 italic">[{group} / {user}]</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}