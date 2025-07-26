import { PDFDocument } from "pdf-lib";
import { moodToSeedSongs } from "./moods";
import { getMoodSegments } from "./recommendation";
import {
  RecommendationParameters,
  trackContentResponseSchema,
} from "./schemas";
import { Chapter, Manga } from "./types";
import { fetchYTMusicDataFromTitle } from "./ytmusic";

// NOTE: keep this commented here for now in case the current fetchMangaDetails breaks
// type Tag = {
//   id: string;
//   type: string;
//   attributes:{
//     name: {
//       [lang: string]: string;
//     };
//     group: string;
//   };
// };

// export async function fetchMangaDetails(mangaId:string){
//   try{
//     const res = await fetch('https://api.mangadex.org/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=tags');
//     const data = await res.json();
//     const manga = data.data;
//     const attributes = manga.attributes
//     const title = attributes.title.en;
//     const description = attributes.description.en;

//     // get author and artist
//     const author = manga.relationships.find((rel: any) => rel.type === "author")?.attributes.name ?? "Unknown";
//     const artist = manga.relationships.find((rel: any) => rel.type === "artist")?.attributes.name ?? "Unknown";

//     const tags = attributes.tags.map((tag: any) => ({
//       name: tag.attributes.name.en,
//       group: tag.attributes.group,
//     }));

//     const genres = tags.filter((t: Tag) => t.attributes.group === "genre").map((t: Tag) => t.attributes.name);
//     const themes = tags.filter((t: Tag) => t.attributes.group === "theme").map((t: Tag) => t.attributes.name);
//     const demographic = tags.find((t: Tag) => t.attributes.group === "demographic")?.name ?? "Unknown";

//     return {
//       title,
//       description,
//       author,
//       artist,
//       genres,
//       themes,
//       demographic,
//     };
//   } catch (error){
//     console.error("Whoops, failed to fetch details for this manga:", error);
//     return null;
//   }
// }

export async function fetchMangaDetails(mangaId: string): Promise<Manga> {
  const res = await fetch(
    `https://api.mangadex.org/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=cover_art`
  );

  if (!res.ok) {
    throw new Error("Whoops! Failed to fetch manga details.");
  }

  const json = await res.json();
  return json.data as Manga;
}

export async function fetchMangaChapters(mangaId: string): Promise<Chapter[]> {
  const res = await fetch(
    `https://api.mangadex.org/chapter?manga=${mangaId}&limit=100&translatedLanguage[]=en&order[chapter]=desc&includes[]=scanlation_group&includes[]=user`
  );

  if (!res.ok) {
    throw new Error("Whoops! Failed to fetch manga chapters.");
  }

  const json = await res.json();
  const chapters: Chapter[] = json.data;

  return chapters;
}

export async function getChapterImages(chapterId: string) {
  try {
    const res = await fetch(
      `https://api.mangadex.org/at-home/server/${chapterId}`
    );
    const data = await res.json();

    const baseUrl = data.baseUrl;
    const hash = data.chapter.hash;
    const imageUrls = data.chapter.data.map(
      (filename: string) => `${baseUrl}/data/${hash}/${filename}`
    );

    return imageUrls;
  } catch (err) {
    console.error("Image fetch FAILED: ", err);
  }
}

// Refer to this: https://reccobeats.com/docs/apis/get-recommendation
export async function getTitleRecommendations(
  parameters: RecommendationParameters,
  moodCategory: string
) {
  const myHeaders = new Headers();

  // Convert parameters to URLSearchParams
  const searchParams = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    searchParams.append(key, value.toString());
  });

  // Get seed songs based on mood category or use default seeds if not found
  const seedSongs = moodToSeedSongs[
    moodCategory as keyof typeof moodToSeedSongs
  ] ?? [
    "1x2uye0yok42ce8EjRZCil", // GATE OF STEINER (default fallback)
  ];

  if (seedSongs.length === 0) {
    console.warn(
      `No seed songs found for mood category: ${moodCategory}, using default`
    );
  }

  const NUM_RECOMMENDATIONS = 2;

  searchParams.append("size", NUM_RECOMMENDATIONS.toString());
  searchParams.append("seeds", seedSongs.join(","));
  searchParams.append("instrumentalness", "1.0");

  const recommendations = await fetch(
    `https://api.reccobeats.com/v1/track/recommendation?${searchParams.toString()}`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );

  if (!recommendations.ok) {
    console.error("Failed to fetch recommendations");
    console.log(searchParams.toString());
    return [];
  }

  const result = await recommendations.json();

  const parsed = trackContentResponseSchema.safeParse(result);

  if (parsed.success === false) {
    console.error("Failed to parse recommendations:", parsed.error);
    return [];
  }

  // console.log("Recommendations received:", parsed.data);

  const data = parsed.data.content.map((item) => ({
    href: item.href,
    title: item.trackTitle,
    id: item.id,
    artist: item.artists.join(", "),
  }));

  return data;
}

export async function getRecommendedURLs(chapterId: string) {
  const imageUrls = await getChapterImages(chapterId);

  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  console.log(`Found ${imageUrls.length} images for chapter ${chapterId}`);
  console.log("Converting images to PDF...");

  const pdfBytes = await createPDFFromImages(imageUrls);

  console.log("PDF created, sending to AI for mood analysis...");

  const { result } = await getMoodSegments(pdfBytes);

  console.log("AI analysis complete:", result);

  const titlesPerSegment = await Promise.all(
    result.map(async (segment) => {
      console.log(
        "Getting recommendations for segment:",
        segment.start,
        segment.end,
        "mood category:",
        segment.moodCategory,
        "description:",
        segment.moodDescription
      );
      const recommendations = await getTitleRecommendations(
        segment.parameters,
        segment.moodCategory
      );

      if (!recommendations || recommendations.length === 0) {
        console.warn(
          `No recommendations found for segment from page ${segment.start} to ${segment.end}`
        );
      }

      return {
        start: segment.start,
        end: segment.end,
        moodDescription: segment.moodDescription,
        moodCategory: segment.moodCategory,
        confidence: segment.confidence,
        recommendations,
      };
    })
  );

  const youtubeURLs = await Promise.all(
    titlesPerSegment.map((segment) => {
      const searchQuery = `${segment.recommendations[0]?.artist} - ${segment.recommendations[0]?.title}`;
      return fetchYTMusicDataFromTitle(searchQuery);
    })
  );

  return titlesPerSegment;
}

async function createPDFFromImages(imageUrls: string[]) {
  const pdfDoc = await PDFDocument.create();

  // Fetch all images in parallel and include content type
  const imageDataList = await Promise.all(
    imageUrls.map(async (url) => {
      const response = await fetch(url);
      const contentType = response.headers.get("content-type") || "";
      const buffer = await response.arrayBuffer();

      return { buffer, contentType };
    })
  );

  // Process each image
  for (const { buffer, contentType } of imageDataList) {
    let image;

    if (contentType.includes("png")) {
      image = await pdfDoc.embedPng(buffer);
    } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      image = await pdfDoc.embedJpg(buffer);
    } else {
      console.warn(`Unsupported content type: ${contentType}`);
      continue;
    }

    const { width, height } = image.scale(1);

    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
