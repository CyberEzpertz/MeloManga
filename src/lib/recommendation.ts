import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import {
  MoodOutput,
  moodOutputSchema,
  PageAnalysisResult,
  pageAnalysisResultSchema,
  SegmentationResult,
  segmentationResultSchema,
} from "./schemas";

// Analyzes visual elements and text in pages
async function pageAnalysisAgent(
  pdfBytes: Uint8Array
): Promise<PageAnalysisResult> {
  const analysis = await generateObject<PageAnalysisResult>({
    model: google("gemini-2.5-flash"),
    schema: pageAnalysisResultSchema,
    system: `
    Analyze manga pages for visual storytelling elements and emotional content.
    Focus on:
    - Panel layout and composition
    - Character expressions and body language
    - Scene composition and depth
    - Movement and action flow
    - Text integration and context
    
    Skip non-story pages (title, credits, ads).
    
    Provide for each page:
    1. Page number
    2. Visual elements analysis
       - Panel layout type
       - Key expressions
       - Movement quality
       - Compositional focus
    3. Text elements
       - Important dialogue
       - Narrative text
       - Sound effects
    4. Emotional tone keywords
    5. Confidence score`,
    messages: [
      {
        role: "user",
        content: [
          { type: "file", mimeType: "application/pdf", data: pdfBytes },
          {
            type: "text",
            text: "Analyze the visual and textual elements of these pages.",
          },
        ],
      },
    ],
  });

  return analysis.object;
}

// Creates mood segments from page analysis
async function segmentationAgent(
  analysis: PageAnalysisResult
): Promise<SegmentationResult> {
  const segments = await generateObject<SegmentationResult>({
    model: google("gemini-2.5-flash"),
    schema: segmentationResultSchema,
    system: `
    Create emotionally coherent segments from manga page analysis.
    Requirements:
    - Minimum 6 pages per segment unless strong mood shift
    - Clear emotional progression
    - Smooth transitions between segments
    - Consistent mood within segments
    
    For each segment provide:
    1. Page range (start-end)
    2. Primary mood
    3. Emotional undertones
    4. Intensity level
    5. Transition type to next segment
    6. Confidence score`,
    messages: [
      {
        role: "user",
        content: JSON.stringify(analysis),
      },
    ],
  });

  return segments.object;
}

// Converts segments to music parameters
async function musicParametersAgent(
  segments: SegmentationResult
): Promise<MoodOutput> {
  const parameters = await generateObject<MoodOutput>({
    model: google("gemini-2.5-flash"),
    schema: moodOutputSchema,
    system: `
    Generate music parameters for manga segments.
    Follow these constraints:
    - acousticness: 0.1-1.0 (organic/synthetic)
    - danceability: 0.0-0.5 (narrative focus)
    - energy: 0.1-1.0 (intensity)
    - instrumentalness: 0.7-1.0 (no vocals)
    - liveness: 0.1-0.5 (studio quality)
    - loudness: -25.0 to -5.0 (volume)
    - mode: 0=minor, 1=major (emotional tone)
    - speechiness: 0.0-0.2 (no speaking)
    - tempo: 60-180 BPM (pacing)
    - valence: 0.0-1.0 (positivity)`,
    messages: [
      {
        role: "user",
        content: JSON.stringify(segments),
      },
    ],
  });

  return parameters.object;
}

export async function getMoodSegments(
  pdfBytes: Uint8Array
): Promise<MoodOutput> {
  try {
    // Step 1: Analyze pages
    const analysis = await pageAnalysisAgent(pdfBytes);
    console.log("Page analysis complete:", analysis);

    // Step 2: Create mood segments
    const segments = await segmentationAgent(analysis);
    console.log("Segmentation complete:", segments);

    // Step 3: Generate music parameters
    const result = await musicParametersAgent(segments);
    console.log("Music parameters generated:", result);

    return result;
  } catch (error) {
    console.error("Error in mood analysis pipeline:", error);
    throw error;
  }
}

// Test function
async function testMoodAnalysis() {
  try {
    const testPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const result = await getMoodSegments(testPdfBytes);
    console.log("Test complete. Results:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Uncomment to run test
// testMoodAnalysis().catch(console.error);
