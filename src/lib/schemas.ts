import { z } from "zod";
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
  // popularity: z.number().int().min(0).max(100),
  // featureWeight: z.number().min(1).max(5),
});

export type RecommendationParameters = z.infer<
  typeof recommendationParametersSchema
>;

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

export type TrackArtist = z.infer<typeof trackArtistSchema>;
export type TrackContent = z.infer<typeof trackContentSchema>;
export type TrackContentResponse = z.infer<typeof trackContentResponseSchema>;
