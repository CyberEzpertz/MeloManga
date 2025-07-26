import { getYoutubeURLResult } from "@/lib/ytmusic";

interface Props {}
export default async function musicPage({}: Props) {
  const data2 = await getYoutubeURLResult("Sensitive Kind - Manja Sjogren");
  return <div>{JSON.stringify(data2)}</div>;
}
