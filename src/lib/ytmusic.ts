import YouTube from "youtube-sr";

export async function getYoutubeURLResult(query: string) {
  const videos = await YouTube.search(query, {
    limit: 1,
    type: "video",
  });

  return videos[0].url;
}
