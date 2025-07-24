"use server";

import { z } from "zod";
import { trackContentResponseSchema } from "./schemas";

// Define the audio features response schema
const audioFeaturesSchema = z.object({
  id: z.string(),
  acousticness: z.number(),
  danceability: z.number(),
  energy: z.number(),
  instrumentalness: z.number(),
  liveness: z.number(),
  loudness: z.number(),
  speechiness: z.number(),
  tempo: z.number(),
  valence: z.number(),
});

type AudioFeatures = z.infer<typeof audioFeaturesSchema>;
type EnrichedAudioFeatures = AudioFeatures & { title: string };

export async function getSongsFeatures(
  songIds: string[]
): Promise<EnrichedAudioFeatures[]> {
  try {
    // Get track details for all songs in one request
    const trackResponse = await fetch(
      `https://api.reccobeats.com/v1/track?ids=${songIds.join(",")}`
    );

    if (!trackResponse.ok) {
      throw new Error(
        `Failed to fetch track details: ${trackResponse.statusText}`
      );
    }

    const tracksData = await trackResponse.json();
    const validTracks = trackContentResponseSchema.safeParse(tracksData);

    if (!validTracks.success) {
      console.error("Invalid track response format:", validTracks.error);
      return [];
    }

    console.log(validTracks.data);

    // Log any missing tracks
    const foundTrackIds = validTracks.data.content.map((track) => track.id);
    const foundTrackLinks = validTracks.data.content.map((track) => track.href);
    const missingTracks = songIds.filter(
      (id) => !foundTrackLinks.find((link) => link.includes(id))
    );
    if (missingTracks.length > 0) {
      console.error("Some tracks were not found:", missingTracks);
    }

    // Create a map of track IDs to titles
    const trackTitles = new Map(
      validTracks.data.content.map((track) => [track.id, track.trackTitle])
    );

    // Fetch audio features for each valid track
    const audioFeatures = await Promise.all(
      foundTrackIds.map(async (trackId) => {
        const featuresResponse = await fetch(
          `https://api.reccobeats.com/v1/track/${trackId}/audio-features`
        );

        if (!featuresResponse.ok) {
          console.error(`Failed to fetch audio features for track ${trackId}`);
          return null;
        }

        const featuresData = await featuresResponse.json();
        const validFeatures = audioFeaturesSchema.safeParse(featuresData);

        if (!validFeatures.success) {
          console.error(
            `Invalid audio features format for track ${trackId}:`,
            validFeatures.error
          );
          return null;
        }

        return {
          ...validFeatures.data,
          title: trackTitles.get(trackId) || "Unknown Title",
        };
      })
    );

    // Filter out any null results from failed requests
    return audioFeatures.filter(
      (features): features is EnrichedAudioFeatures => features !== null
    );
  } catch (error) {
    console.error("Error fetching song features:", error);
    return [];
  }
}
