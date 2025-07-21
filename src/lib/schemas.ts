import { z } from "zod";

// Music Parameters Schema
export const recommendationParametersSchema = z.object({
  acousticness: z.number().min(0).max(1),
  danceability: z.number().min(0).max(1),
  energy: z.number().min(0).max(1),
  instrumentalness: z.number().min(0.5).max(1),
  liveness: z.number().min(0).max(1),
  loudness: z.number().min(-60).max(2),
  mode: z.number().int().min(0).max(1),
  speechiness: z.number().min(0).max(1),
  tempo: z.number().min(0).max(250),
  valence: z.number().min(0).max(1),
});

// Track Content Schemas
export const trackArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  href: z.string(),
});

export const trackContentSchema = z.object({
  id: z.string(),
  trackTitle: z.string(),
  artists: z.array(trackArtistSchema),
  durationMs: z.number().int(),
  href: z.string(),
  popularity: z.number().int().min(0),
});

export const trackContentResponseSchema = z.object({
  content: z.array(trackContentSchema),
});

// Page Analysis Schemas
export const visualElementSchema = z.object({
  panelLayout: z.enum([
    "standard",
    "dynamic",
    "scattered",
    "focused",
    "overlapping",
    "full-page",
  ]),
  expressions: z.array(z.string()),
  movement: z.enum(["static", "flowing", "intense", "chaotic", "calm"]),
  composition: z.object({
    focalPoint: z.string(),
    depth: z.enum(["flat", "shallow", "deep"]),
    emphasis: z.array(z.string()),
  }),
});

export const textElementSchema = z.object({
  dialogue: z.array(z.string()).optional(),
  narration: z.array(z.string()).optional(),
  soundEffects: z.array(z.string()).optional(),
});

export const pageAnalysisSchema = z.object({
  pageNumber: z.number().int().positive(),
  visualElements: visualElementSchema,
  textElements: textElementSchema.optional(),
  emotionalTone: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const pageAnalysisResultSchema = z.object({
  pages: z.array(pageAnalysisSchema),
  metadata: z.object({
    totalPages: z.number().int().positive(),
    skipPages: z.array(z.number()).optional(),
    processingTime: z.number(),
  }),
});

// Segmentation Schemas
export const segmentSchema = z.object({
  start: z.number().int().positive(),
  end: z.number().int().positive(),
  mood: z.string(),
  confidence: z.number().min(0).max(1),
  emotions: z.array(z.string()),
  intensity: z.enum(["low", "medium", "high", "extreme"]),
  transition: z.object({
    type: z.enum(["gradual", "sudden", "none"]),
    nextMood: z.string().optional(),
  }),
});

export const segmentationResultSchema = z.object({
  segments: z.array(segmentSchema),
  metadata: z.object({
    averageSegmentLength: z.number(),
    totalSegments: z.number().int(),
    confidenceAverage: z.number().min(0).max(1),
  }),
});

// Final Output Schema
export const moodOutputSchema = z.object({
  result: z.array(
    z.object({
      start: z.number().int(),
      end: z.number().int(),
      mood: z.string(),
      confidence: z.number().min(0).max(1),
      parameters: recommendationParametersSchema,
    })
  ),
});

// Type Exports
export type RecommendationParameters = z.infer<
  typeof recommendationParametersSchema
>;
export type TrackArtist = z.infer<typeof trackArtistSchema>;
export type TrackContent = z.infer<typeof trackContentSchema>;
export type TrackContentResponse = z.infer<typeof trackContentResponseSchema>;
export type VisualElement = z.infer<typeof visualElementSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type PageAnalysis = z.infer<typeof pageAnalysisSchema>;
export type PageAnalysisResult = z.infer<typeof pageAnalysisResultSchema>;
export type Segment = z.infer<typeof segmentSchema>;
export type SegmentationResult = z.infer<typeof segmentationResultSchema>;
export type MoodOutput = z.infer<typeof moodOutputSchema>;
