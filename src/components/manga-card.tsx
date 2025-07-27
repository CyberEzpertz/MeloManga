"use client";
import { Manga } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MangaCardProps {
  manga: Manga;
}
export default function MangaCard({ manga }: MangaCardProps) {
  const router = useRouter();
  const author = manga.relationships.find((rel) => rel.type === "author");

  const coverFileName = manga.relationships.find((r) => r.type === "cover_art")
    ?.attributes?.fileName;
  const coverUrl = coverFileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.512.jpg`
    : null;

  const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(coverUrl || "")}`;

  const onClick = () => {
    router.push(`/title/${manga.id}`);
  };

  return (
    <div
      className="border-border bg-card flex max-h-[450px] min-h-[400px] cursor-pointer flex-col overflow-hidden rounded-xl border drop-shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative min-h-0 flex-1">
        <Image
          src={proxyUrl!}
          alt={manga.attributes.title["en"]}
          fill
          objectFit="cover"
          data-loaded="false"
          onLoad={(event) => {
            event.currentTarget.setAttribute("data-loaded", "true");
          }}
          className="h-full w-full data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/50"
          decoding="async"
        />
      </div>

      <div className="shrink-0 p-4">
        <h3 className="truncate font-bold">{manga.attributes.title["en"]}</h3>
        <p className="text-muted-foreground">{author?.attributes?.name}</p>
      </div>
    </div>
  );
}
