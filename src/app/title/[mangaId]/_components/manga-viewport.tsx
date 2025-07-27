"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import type { Chapter, Manga } from "@/lib/types";
import { Calendar, ChevronLeft, Eye, Music, User, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
    ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`
    : null;

  const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(coverUrl || "")}`;

  const handleReadWithMusic = (chapterId: string) => {
    router.push(`/chapter/${chapterId}?music=true`);
  };

  const handleRead = (chapterId: string) => {
    router.push(`/chapter/${chapterId}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div>
      <div className="border-border flex w-full flex-row items-center justify-between border-b px-4 py-2">
        <Button
          className="rounded-full"
          size="icon"
          variant="ghost"
          onClick={handleBack}
        >
          <ChevronLeft className="size-4 text-blue-500" />
        </Button>
        <ThemeToggle />
      </div>
      <div className="hidden flex-col p-6 md:flex">
        <div className="flex flex-col gap-8">
          <div className="flex gap-8">
            <div className="relative h-auto w-64 shrink-0 overflow-hidden rounded-xl shadow-lg">
              {proxyUrl && (
                <Image
                  src={proxyUrl}
                  alt="Cover Art"
                  fill
                  objectFit="cover"
                  data-loaded="false"
                  onLoad={(event) => {
                    event.currentTarget.setAttribute("data-loaded", "true");
                  }}
                  className="h-full w-full flex-1 data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/20"
                />
              )}
            </div>
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl font-bold tracking-tight">{enTitle}</h1>
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
                  About
                </h3>
                <p className="text-muted-foreground text-pretty">{enDesc}</p>
                <div className="mt-4 flex flex-col gap-1">
                  <p className="text-muted-foreground text-sm">
                    Author: {authorNames}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Artist: {artistNames}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Status: {status} | Demographic: {demographic}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="border-primary text-primary bg-primary/20 rounded-full border-2 px-4 py-1 text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
              Chapters
            </h3>
            <div className="flex flex-col gap-4">
              {chapters.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No chapters found.
                </p>
              ) : (
                chapters.map((ch) => {
                  const group =
                    ch.relationships.find((r) => r.type === "scanlation_group")
                      ?.attributes?.name ?? "Unknown Group";
                  const user =
                    ch.relationships.find((r) => r.type === "user")?.attributes
                      ?.username ?? "Unknown Uploader";
                  return (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold uppercase">
                          CH. {ch.attributes.chapter || "0"} -{" "}
                          {ch.attributes.title || "Untitled"}
                        </p>
                        <div className="text-muted-foreground flex flex-col gap-2 text-xs font-medium">
                          <span className="inline-flex items-center gap-2">
                            <Calendar className="size-4" />
                            {new Date(
                              ch.attributes.publishAt
                            ).toLocaleDateString()}
                          </span>
                          <span className="text-muted-foreground inline-flex items-center gap-2 italic">
                            <Users className="size-4" />[{group} / {user}]
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReadWithMusic(ch.id)}
                        >
                          <Music className="size-4" /> Read with Music
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRead(ch.id)}
                        >
                          <Eye className="size-4" /> Read
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-stretch justify-center md:hidden">
        <div className="relative h-[80vh] w-full">
          {proxyUrl && (
            <Image
              src={proxyUrl}
              alt="Cover Art"
              fill
              objectFit="cover"
              data-loaded="false"
              onLoad={(event) => {
                event.currentTarget.setAttribute("data-loaded", "true");
              }}
              className="h-full w-full flex-1 data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/20"
            />
          )}
        </div>
        <div className="bg-background z-10 -mt-8 flex w-full flex-col gap-8 rounded-t-4xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold tracking-tight">{enTitle}</h2>
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
              About
            </h3>
            <p className="text-muted-foreground text-sm text-pretty">
              {enDesc}
            </p>
          </div>
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="border-primary text-primary bg-primary/20 rounded-full border-2 px-4 py-1 text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
              Chapters
            </h3>
            <div className="flex flex-wrap gap-2">
              {chapters.map((ch) => {
                const user =
                  ch.relationships.find((r) => r.type === "user")?.attributes
                    ?.username ?? "Unknown Uploader";
                return (
                  <div
                    className="border-border flex w-full flex-row justify-between border-t py-4"
                    key={ch.id}
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold uppercase">
                        CH. {ch.attributes.chapter || "0"} -{" "}
                        {ch.attributes.title || "Untitled"}
                      </p>
                      <div className="text-muted-foreground flex flex-col gap-2 text-xs font-bold">
                        <span className="inline-flex gap-2">
                          <Calendar className="size-4" />
                          {new Date(
                            ch.attributes.publishAt
                          ).toLocaleDateString()}
                        </span>
                        <span className="text-muted-foreground inline-flex items-center gap-2 italic">
                          <User className="size-4" />
                          {user}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReadWithMusic(ch.id)}
                      >
                        <Music className="size-4" /> Read with Music
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRead(ch.id)}
                      >
                        <Eye className="size-4" /> Read
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
