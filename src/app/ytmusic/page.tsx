import { ThemeToggle } from "@/components/theme-toggle";
import { getTestURLs } from "@/lib/ytmusic";
import TestPlayer from "./_components/test-player";

interface Props {}
export default async function musicPage({}: Props) {
  const data2 = getTestURLs();
  return (
    <div>
      <ThemeToggle />
      <TestPlayer songsPromise={data2} />
    </div>
  );
}
