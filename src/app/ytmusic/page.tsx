import { fetchYTMusicDataFromTitle } from "@/lib/ytmusic";

interface Props {}
export default async function musicPage({}: Props) {
  const data = await fetchYTMusicDataFromTitle(
    "Sensitive Kind - Manja Sjogren"
  );
  return <div>{JSON.stringify(data)}</div>;
}
