import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { PDFDocument } from "pdf-lib";
import { moodOutputSchema, RecommendationParameters } from "./schemas";

const RECOMMENDATION_PROMPT = `
Analyze the sequence of images in the provided chapter (PDF). Segment the pages into emotional mood groups based on visual cues and text.

Guidelines:
- Each segment should reflect a consistent emotional tone (e.g. joyful, tense, melancholic).
- Use visual elements like facial expressions, color tones, scene composition, and action to determine mood.
- Use the text content to enhance mood understanding, but focus primarily on visual cues.
- Include all pages.
- Prefer segments that span at least 2 pages, but isolate a page if its mood clearly differs.
- Ensure clear transitions between segments.

For each segment, provide:
- start: starting page number
- end: ending page number
- mood: a concise emotional label (e.g. happy, sad, angry)
- confidence: float (0.0–1.0) representing confidence in mood detection
- parameters: JSON object with the following fields:
  - acousticness: 0.0–1.0
  - danceability: 0.0–1.0
  - energy: 0.0–1.0
  - instrumentalness: 0.0–1.0
  - key: -1 to 11
  - liveness: 0.0–1.0
  - loudness: -60.0 to 2.0
  - mode: 0 (minor) or 1 (major)
  - speechiness: 0.0–1.0
  - tempo: 0.0–250.0
  - valence: 0.0–1.0
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

export async function getTitleRecommendations(
  parameters: RecommendationParameters
): Promise<string[]> {
  // Implementation for fetching title recommendations
  return [];
}

export async function getRecommendedURLs(chapterId: string) {
  const imageUrls = await getChapterImages(chapterId);

  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  const pdfBytes = await createPDFFromImages(imageUrls);

  const result = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: moodOutputSchema,
    prompt: RECOMMENDATION_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            mimeType: "application/pdf",
            data: pdfBytes,
          },
          {
            type: "text",
            text: `Analyze the chapter with ID ${chapterId} and provide mood recommendations.`,
          },
        ],
      },
    ],
  });

  const titlesPerSegment = await Promise.all(
    result.object.result.map(async (segment) => {
      const recommendations = await getTitleRecommendations(segment.parameters);

      if (!recommendations || recommendations.length === 0) {
        console.warn(
          `No recommendations found for segment from page ${segment.start} to ${segment.end}`
        );
      }

      console.log(
        `Segment from page ${segment.start} to ${segment.end} with mood "${segment.mood}" and confidence ${segment.confidence}`
      );
      console.log(`Recommendations: ${recommendations.join(", ")}`);

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

  for (const url of imageUrls) {
    // Fetch image
    const imageResponse = await fetch(url);
    const imageBytes = await imageResponse.arrayBuffer();

    const image = await pdfDoc.embedPng(imageBytes);
    // Create a new page
    const { width, height } = image.size();

    const page = pdfDoc.addPage([width, height]);

    // Draw image on page
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
