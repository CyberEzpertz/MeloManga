"use client";

import type { Chapter, Manga } from "@/lib/types";
import { use } from "react";

export default function MangaViewport({
  mangaId,
  detailsPromise,
  chaptersPromise,
}: {
  mangaId: string;
  detailsPromise: Promise<Manga>;
  chaptersPromise: Promise<Chapter[]>;
}) {
  const details = use(detailsPromise);
  const chapters = use(chaptersPromise);

  if (!details) return <div>Loading manga...</div>;

  const enTitle = details.attributes.title["en"];
  const enDesc =
    details.attributes.description["en"] ?? "No description available.";
  const demographic = details.attributes.publicationDemographic ?? "Unknown";
  const status = details.attributes.status ?? "Unknown";

  const authorNames =
    details.relationships
      .filter((r) => r.type === "author" && r.attributes?.name)
      .map((r) => r.attributes!.name)
      .join(", ") || "Unknown";

  const artistNames =
    details.relationships
      .filter((r) => r.type === "artist" && r.attributes?.name)
      .map((r) => r.attributes!.name)
      .join(", ") || "Unknown";

  const tags = details.attributes.tags.map((tag) => tag.attributes.name["en"]);

  const coverFileName = details.relationships.find(
    (r) => r.type === "cover_art"
  )?.attributes?.fileName;
  const coverUrl = coverFileName
    ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}.256.jpg`
    : null;

  //full disclosure: I used chatGPT to help with the styling
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {coverUrl && (
          <img
            src={coverUrl}
            alt="Cover Art"
            className="h-auto w-48 rounded shadow-md"
          />
        )}

        <div>
          <h1 className="text-3xl font-bold">{enTitle}</h1>
          <p className="mt-2 text-gray-700">{enDesc}</p>
          <p className="mt-1 text-sm text-gray-600">
            Author: {authorNames} &nbsp;|&nbsp; Artist: {artistNames}
          </p>
          <p className="text-sm text-gray-600">
            Status: {status} &nbsp;|&nbsp; Demographic: {demographic}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mt-4 text-2xl font-semibold">Chapters</h2>
        {chapters.length === 0 ? (
          <p className="mt-1 text-sm text-gray-600">No chapters found.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {chapters.map((ch) => {
              const group =
                ch.relationships.find((r) => r.type === "scanlation_group")
                  ?.attributes?.name ?? "Unknown Group";
              const user =
                ch.relationships.find((r) => r.type === "user")?.attributes
                  ?.username ?? "Unknown Uploader";

              return (
                <li key={ch.id} className="text-sm">
                  <span className="font-medium">
                    Ch. {ch.attributes.chapter || "?"}
                  </span>
                  : {ch.attributes.title || "Untitled"}{" "}
                  <span className="text-xs text-gray-500">
                    ({new Date(ch.attributes.publishAt).toLocaleDateString()})
                  </span>{" "}
                  <span className="ml-1 text-xs text-gray-400 italic">
                    [{group} / {user}]
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
