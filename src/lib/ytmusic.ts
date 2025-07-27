import { MusicSegment } from "@/components/player-bar";
import YouTube from "youtube-sr";

export async function getYoutubeURLResult(query: string) {
  console.log("Searching YouTube for:", query);

  const videos = await YouTube.search(query, {
    limit: 2,
    type: "video",
  });

  console.log("YouTube search results:");
  videos.forEach((video) => {
    console.log(`Title: ${video.title}
      URL: ${video.url}
      Artist: ${video.channel?.name}
    `);
  });

  return {
    url: videos[0].url,
    title: videos[0].title,
    thumbnailUrl: videos[0].thumbnail?.url,
    artist: videos[0].channel?.name,
  };
}

export async function getTestURLs() {
  const promise = new Promise<MusicSegment[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          start: 0,
          end: 2,
          src: "https://youtu.be/5yHaatld7rY?list=RDZ6nzdtuHi0Y",
          thumbnailUrl:
            "https://i.ytimg.com/vi/YKYyR6_epRc/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLD-XUHlX905vvomkgc2pH-mEeFuoA",
          artist: "IV of Spades",
          title: "Aura",
        },
        {
          start: 3,
          end: 5,
          src: "https://youtu.be/Z6nzdtuHi0Y?list=RDZ6nzdtuHi0Y",
          thumbnailUrl:
            "https://i.ytimg.com/vi/YKYyR6_epRc/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLD-XUHlX905vvomkgc2pH-mEeFuoA",
          artist: "Zild",
          title: "Lia",
        },
        {
          start: 6,
          end: 8,
          src: "https://youtu.be/CATqZ-L_d8I?list=RDCATqZ-L_d8I",
          thumbnailUrl:
            "https://i.ytimg.com/vi/YKYyR6_epRc/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLD-XUHlX905vvomkgc2pH-mEeFuoA",
          artist: "Zild",
          title: "Apat",
        },
      ]);
    }, 1000);
  });
  return promise;
}
