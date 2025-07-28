import { MusicSegment } from "@/components/player-bar";
import { PDFDocument } from "pdf-lib";
import { Mood, moodToSeedSongs } from "./moods";
import { getSongsFeatures } from "./reccobeats";
import { getMoodSegments } from "./recommendation";
import {
  RecommendationParameters,
  trackContentResponseSchema,
} from "./schemas";
import { scoreRecommendation } from "./scoring";
import { Chapter, Manga } from "./types";
import { getYoutubeURLResult } from "./ytmusic";

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
  moodCategory: string,
  scored: boolean = false
): Promise<
  Array<{
    href: string;
    title: string;
    id: string;
    artist: string;
    score?: number;
  }>
> {
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

  const NUM_RECOMMENDATIONS = 10;
  searchParams.append("size", NUM_RECOMMENDATIONS.toString());
  searchParams.append("seeds", seedSongs.join(","));
  searchParams.append("instrumentalness", "0.8");

  // Fetch recommendations
  const response = await fetch(
    `https://api.reccobeats.com/v1/track/recommendation?${searchParams.toString()}`,
    {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch recommendations");
    console.log(searchParams.toString());
    return [];
  }

  const result = await response.json();
  const parsed = trackContentResponseSchema.safeParse(result);

  if (!parsed.success) {
    console.error("Failed to parse recommendations:", parsed.error);
    return [];
  }

  // Get audio features for filtering by instrumentalness
  console.log("Getting audio features for recommendations...");
  const recommendedIds = parsed.data.content.map((item) => item.id);
  const audioFeatures = await getSongsFeatures(recommendedIds);
  const featuresMap = new Map(
    audioFeatures.map((features) => [features.id, features])
  );

  // Process recommendations
  type Recommendation = {
    href: string;
    title: string;
    id: string;
    artist: string;
    score?: number;
  };

  const filteredRecommendations: Recommendation[] = parsed.data.content
    .map((item) => {
      const features = featuresMap.get(item.id);
      if (!features || features.instrumentalness < 0.8) return null;

      const baseRecommendation = {
        href: item.href,
        title: item.trackTitle,
        id: item.id,
        artist: item.artists
          .map((a) => a.name)
          .slice(0, 2)
          .join(", "),
      };

      if (!scored) return baseRecommendation;

      const score = scoreRecommendation(
        features,
        parameters,
        moodCategory as Mood
      );
      return score > 0 ? { ...baseRecommendation, score } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Sort by score if in scored mode
  if (scored) {
    filteredRecommendations.sort((a, b) => {
      const scoreA = typeof a.score === "number" ? a.score : 0;
      const scoreB = typeof b.score === "number" ? b.score : 0;
      return scoreB - scoreA;
    });
  }

  console.log("Processed recommendations:", filteredRecommendations);
  return filteredRecommendations;
}

export async function getRecommendedURLs(
  chapterId: string,
  scored: boolean
): Promise<MusicSegment[]> {
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
        segment.moodCategory,
        scored
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

  for (const song of titlesPerSegment) {
    console.log(
      `Song from ${song.start} to ${song.end}: Mood - ${song.moodDescription} (${song.moodCategory}), Confidence - ${song.confidence}`
    );
    console.log("Recommendations:", song.recommendations);
  }

  const youtubeURLs = await Promise.all(
    titlesPerSegment.map(async (segment) => {
      // Process all recommendations for the segment
      const urls = await Promise.all(
        segment.recommendations.map(async (rec) => {
          try {
            const searchQuery = `${rec.artist} - ${rec.title}`;
            return await getYoutubeURLResult(searchQuery);
          } catch (error) {
            console.warn(`Failed to get YouTube URL for ${rec.title}:`, error);
            return null;
          }
        })
      );

      const video = urls.filter((a) => a !== null)[0];

      return {
        start: segment.start,
        end: segment.end,
        src: video.url,
        thumbnailUrl: video.thumbnailUrl || "",
        title: video.title || "",
        artist: video.artist || "",
      };
    })
  );

  return youtubeURLs;
}

async function createPDFFromImages(imageUrls: string[]) {
  const pdfDoc = await PDFDocument.create();

  const imageDataList = await Promise.all(
    imageUrls.map(async (url) => {
      const response = await fetch(url);
      const contentType = response.headers.get("content-type") || "";
      const buffer = await response.arrayBuffer();

      return { buffer, contentType };
    })
  );

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
