import { fetchYTMusicDataFromTitle, fetchYTSearchResults } from "@/lib/ytmusic";

interface Props {}
export default async function musicPage({}: Props) {
  const data = await fetchYTMusicDataFromTitle(
    "Sensitive Kind - Manja Sjogren"
  );

  const data2 = await fetchYTSearchResults("Sensitive Kind - Manja Sjogren");
  return (
    <div>
      {JSON.stringify(data)} {JSON.stringify(data2)}
    </div>
  );
}
