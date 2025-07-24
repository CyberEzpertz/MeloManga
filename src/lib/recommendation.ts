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
    - Soft minimum of 6 pages per segment unless strong mood shift
    - Avoid segments of only 1-3 pages
    - Clear emotional progression
    - Smooth transitions between segments
    - Consistent mood within segments

    For each segment provide:
    1. Page range (start-end)
    2. Mood categorization:
       - moodCategory: MUST be one of: ["serene", "tense", "melancholic", "action", "romantic", "whimsical"]
       - moodDescription: Detailed emotional description (e.g., "triumphant determination", "growing anxiety")
    3. Emotional undertones (array of complementary emotions)
    4. Intensity level (low/medium/high/extreme)
    5. Transition details:
       - type: gradual/sudden/none
       - nextMood: mood category of next segment (if applicable)
    6. Confidence score (0.0-1.0) for mood classification

    Guidelines for mood categories:
    - serene: Peaceful, contemplative, or gently uplifting moments
    - tense: Suspenseful, dramatic, or uncertain scenes
    - melancholic: Emotional, sad, or reflective passages
    - action: Combat, chase scenes, or high-stakes sequences
    - romantic: Love scenes, tender moments, emotional connections
    - whimsical: Comedic, lighthearted, or playful sequences

    Choose the moodCategory that best fits the segment's overall tone, using moodDescription for nuanced emotional context.`,
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
You are generating music parameters for manga segments. Each segment is annotated with a mood. You must generate fitting music characteristics per mood.

Use the following musical parameter constraints:
- acousticness: 0.0 to 1.0 (higher = more organic/instrumental, lower = more electronic/synthetic)
- danceability: 0.0 to 0.5 (higher = more rhythmically fluid, lower = more static or narrative)
- energy: 0.0 to 1.0 (intensity, dynamics, and activity of the music)
- liveness: 0.0 to 0.5 (higher = more live/performed feel, lower = studio-like sound)
- loudness: -25.0 to -5.0 (volume in dB, higher = louder)
- mode: 0 = minor (darker/sadder), 1 = major (happier/brighter)
- speechiness: 0.0 to 0.2 (higher = more vocal/spoken word presence)
- tempo: 60 to 180 BPM (pacing of the music)
- valence: 0.0 to 0.8 (positivity/musical brightness)
`,
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

// Uncomment to run test
// testMoodAnalysis().catch(console.error);
