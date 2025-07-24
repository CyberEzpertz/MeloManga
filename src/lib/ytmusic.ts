import YTMusic from "ytmusic-api";

interface YTMusicSearchResult {
  id: string;
  title: string;
  type: "SONG" | "VIDEO";
}

const ytmusic = new YTMusic();
await ytmusic.initialize();

export async function fetchYTMusicDataFromTitle(
  title: string
): Promise<YTMusicSearchResult | null> {
  const results = await ytmusic.search(title);
  const songResults = results.filter((r) => r.type === "SONG");

  console.log(results);

  if (songResults.length !== 0) {
    return {
      id: songResults[0].videoId,
      title: songResults[0].name,
      type: "SONG",
    };
  }

  const videoResults = results.filter((r) => r.type === "VIDEO");

  if (videoResults.length !== 0) {
    return {
      id: videoResults[0].videoId,
      title: videoResults[0].name,
      type: "VIDEO",
    };
  }

  return null;
}

export async function fetchYTMusicDataFromTitles(titles: string[]) {
  return await Promise.all(
    titles.map((title) => fetchYTMusicDataFromTitle(title))
  );
}
