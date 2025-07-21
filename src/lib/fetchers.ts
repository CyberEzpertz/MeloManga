import { PDFDocument } from "pdf-lib";
import { getMoodSegments } from "./recommendation";
import {
  RecommendationParameters,
  trackContentResponseSchema,
} from "./schemas";

const RECOMMENDATION_PROMPT = `
Analyze the sequence of images in the provided manga chapter (PDF). Segment the story pages into cohesive emotional mood groups based on visual storytelling and accompanying text.

Guidelines:
- **Ignore non-story pages** such as the title page, credits, translator notes, donation appeals, and similar fillers. Do not include them in any output.
- Each segment should reflect a **consistent emotional tone** (e.g., hopeful, tense, melancholic) inferred from the story's visuals and pacing.
- Use **visual elements** like facial expressions, panel layout, background detail, shading, and movement to determine mood.
- Use dialogue or narration to support mood identification when necessary, but **prioritize visual cues**.
- Segments should consist of **at least 6 pages**, unless a **strong, clearly defined emotional shift** justifies a shorter span.
- **Favor longer segments** that preserve emotional continuity and minimize disruptive mood changes.
- **Avoid excessive segmentation.** Only split when there's a major tonal transition or narrative shift.
- Emotional transitions between segments should **progress smoothly** — **do not jump** drastically between moods unless the story demands it (e.g., a sudden twist or climax).

For each segment, provide:
- \`start\`: Starting story page number (excluding fillers)
- \`end\`: Ending story page number
- \`mood\`: A concise emotional label (e.g., joyful, dark, anxious)
- \`confidence\`: A float between 0.0–1.0 estimating confidence in mood classification
- \`parameters\`: JSON object with audio traits suitable for **anime-style instrumental music**, following these constraints:
  - \`acousticness\`: 0.1–1.0 (higher for organic/sentimental moments)
  - \`danceability\`: 0.0–0.5 (generally low to maintain narrative focus)
  - \`energy\`: 0.1–1.0 (builds with tension or action)
  - \`instrumentalness\`: 0.7–1.0 (**must be ≥ 0.7 to ensure instrumental-only music**)
  - \`liveness\`: 0.1–0.5 (prefer studio-like recordings, avoid concert feel)
  - \`loudness\`: -25.0 to -5.0 (varies based on mood intensity)
  - \`mode\`: 0 for minor (somber, emotional), 1 for major (hopeful, bright)
  - \`speechiness\`: 0.0–0.2 (very low to eliminate spoken word)
  - \`tempo\`: 60.0–180.0 BPM (aligns with scene pacing)
  - \`valence\`: 0.0–1.0 (lower = darker, higher = more uplifting)

Avoid vocal music and prioritize **emotional cohesion** across segments. The music should feel like a film score — **enhancing** rather than distracting from the visual storytelling.
`;

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
  parameters: RecommendationParameters
): Promise<string[]> {
  const myHeaders = new Headers();

  // Convert parameters to URLSearchParams
  const searchParams = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    searchParams.append(key, value.toString());
  });

  const seedSongs = [
    "1x2uye0yok42ce8EjRZCil", // GATE OF STEINER
    "5FUUGPgA1J5QCkdfnhfeCB", // Surechigau Kokoro to Kokoro,
    "0hHc2igYYlSUyZdByauJmB", // You Say Run
    "6AFkv6rIVRusZNifR74Q7t", // Shingeki GT 20130218 Kyojin
    "5R6jJiQXA866TsPs3xtaAK", // Nakama
  ];

  const NUM_RECOMMENDATIONS = 2;

  searchParams.append("size", NUM_RECOMMENDATIONS.toString());
  searchParams.append("seeds", seedSongs.join(","));

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

  const titles = parsed.data.content.map((item) => item.href);
  return titles;
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

  // const result = await generateObject({
  //   model: google("gemini-2.5-flash"),
  //   schema: moodOutputSchema,
  //   system: RECOMMENDATION_PROMPT,
  //   messages: [
  //     {
  //       role: "user",
  //       content: [
  //         {
  //           type: "file",
  //           mimeType: "application/pdf",
  //           data: pdfBytes,
  //         },
  //         {
  //           type: "text",
  //           text: `Analyze the chapter with ID ${chapterId} and provide mood recommendations.`,
  //         },
  //       ],
  //     },
  //   ],
  // });

  const { result } = await getMoodSegments(pdfBytes);

  console.log("AI analysis complete:", result);

  const titlesPerSegment = await Promise.all(
    result.map(async (segment) => {
      console.log(
        "Getting recommendations for segment:",
        segment.start,
        segment.end
      );
      const recommendations = await getTitleRecommendations(segment.parameters);

      if (!recommendations || recommendations.length === 0) {
        console.warn(
          `No recommendations found for segment from page ${segment.start} to ${segment.end}`
        );
      }

      // console.log(
      //   `Segment from page ${segment.start} to ${segment.end} with mood "${segment.mood}" and confidence ${segment.confidence}`
      // );
      // console.log(`Recommendations: ${recommendations.join(", ")}`);

      return {
        start: segment.start,
        end: segment.end,
        mood: segment.mood,
        confidence: segment.confidence,
        recommendations,
      };
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
