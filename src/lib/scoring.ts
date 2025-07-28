import { Mood } from "./moods";
import { type EnrichedAudioFeatures } from "./reccobeats";
import { RecommendationParameters } from "./schemas";

type FeatureWeight = {
  weight: number; // Importance multiplier
  min: number; // Minimum expected value
  max: number; // Maximum expected value
  ideal: number; // Target value
};

type MoodFeatureWeights = {
  acousticness: FeatureWeight;
  danceability: FeatureWeight;
  energy: FeatureWeight;
  instrumentalness: FeatureWeight & { minThreshold?: number };
  tempo: FeatureWeight;
  valence: FeatureWeight;
};

// Weights and ranges based on seed song analysis
const moodWeights: Record<Mood, MoodFeatureWeights> = {
  serene: {
    acousticness: { weight: 2.0, min: 0.7, max: 0.98, ideal: 0.85 },
    danceability: { weight: 0.5, min: 0.3, max: 0.55, ideal: 0.4 },
    energy: { weight: 2.0, min: 0.1, max: 0.25, ideal: 0.15 },
    instrumentalness: {
      weight: 3.0,
      min: 0.8,
      max: 1.0,
      ideal: 0.9,
      minThreshold: 0.8,
    },
    tempo: { weight: 0.5, min: 85, max: 140, ideal: 110 },
    valence: { weight: 1.0, min: 0.1, max: 0.35, ideal: 0.2 },
  },
  tense: {
    acousticness: { weight: 1.0, min: 0.0, max: 0.9, ideal: 0.3 },
    danceability: { weight: 1.0, min: 0.2, max: 0.45, ideal: 0.35 },
    energy: { weight: 2.0, min: 0.3, max: 0.6, ideal: 0.45 },
    instrumentalness: {
      weight: 3.0,
      min: 0.8,
      max: 1.0,
      ideal: 0.9,
      minThreshold: 0.8,
    },
    tempo: { weight: 1.5, min: 80, max: 172, ideal: 130 },
    valence: { weight: 1.5, min: 0.06, max: 0.25, ideal: 0.15 },
  },
  melancholic: {
    acousticness: { weight: 2.0, min: 0.85, max: 1.0, ideal: 0.95 },
    danceability: { weight: 1.0, min: 0.2, max: 0.5, ideal: 0.3 },
    energy: { weight: 2.0, min: 0.02, max: 0.15, ideal: 0.08 },
    instrumentalness: {
      weight: 3.0,
      min: 0.8,
      max: 1.0,
      ideal: 0.9,
      minThreshold: 0.8,
    },
    tempo: { weight: 1.0, min: 65, max: 97, ideal: 80 },
    valence: { weight: 2.0, min: 0.04, max: 0.3, ideal: 0.15 },
  },
  action: {
    acousticness: { weight: 2.0, min: 0.0, max: 0.1, ideal: 0.002 },
    danceability: { weight: 1.0, min: 0.35, max: 0.6, ideal: 0.45 },
    energy: { weight: 2.0, min: 0.65, max: 0.85, ideal: 0.75 },
    instrumentalness: {
      weight: 3.0,
      min: 0.8,
      max: 1.0,
      ideal: 0.9,
      minThreshold: 0.8,
    },
    tempo: { weight: 1.5, min: 130, max: 155, ideal: 145 },
    valence: { weight: 1.0, min: 0.03, max: 0.9, ideal: 0.4 },
  },
  romantic: {
    acousticness: { weight: 2.0, min: 0.9, max: 1.0, ideal: 0.95 },
    danceability: { weight: 1.0, min: 0.25, max: 0.55, ideal: 0.35 },
    energy: { weight: 2.0, min: 0.08, max: 0.3, ideal: 0.2 },
    instrumentalness: {
      weight: 3.0,
      min: 0.8,
      max: 1.0,
      ideal: 0.9,
      minThreshold: 0.8,
    },
    tempo: { weight: 0.5, min: 70, max: 175, ideal: 120 },
    valence: { weight: 1.5, min: 0.15, max: 0.3, ideal: 0.22 },
  },
  whimsical: {
    acousticness: { weight: 1.0, min: 0.0, max: 1.0, ideal: 0.5 },
    danceability: { weight: 1.5, min: 0.5, max: 0.85, ideal: 0.65 },
    energy: { weight: 1.5, min: 0.25, max: 0.85, ideal: 0.5 },
    instrumentalness: {
      weight: 3.0,
      min: 0.8,
      max: 1.0,
      ideal: 0.8,
      minThreshold: 0.8,
    },
    tempo: { weight: 1.0, min: 85, max: 150, ideal: 120 },
    valence: { weight: 2.0, min: 0.2, max: 0.9, ideal: 0.7 },
  },
};

function scoreFeature(
  value: number,
  weight: FeatureWeight & { minThreshold?: number },
  targetValue?: number
): number {
  // Check if value meets minimum threshold if specified
  if (weight.minThreshold !== undefined && value < weight.minThreshold) {
    return 0;
  }

  // Use the ideal value if no target is provided
  const target = targetValue ?? weight.ideal;

  // Normalize the range to 0-1
  const normalizedValue = (value - weight.min) / (weight.max - weight.min);
  const normalizedTarget = (target - weight.min) / (weight.max - weight.min);

  // Calculate distance from target (0 = perfect match, 1 = maximum difference)
  const distance = Math.abs(normalizedValue - normalizedTarget);

  // Convert distance to score (1 = perfect match, 0 = maximum difference)
  const score = 1 - Math.min(distance, 1);

  // Apply weight
  return score * weight.weight;
}

export function scoreRecommendation(
  features: EnrichedAudioFeatures,
  parameters: RecommendationParameters,
  moodCategory: Mood
): number {
  const weights = moodWeights[moodCategory];

  let totalScore = 0;
  let totalWeight = 0;

  // Score each relevant feature
  const scores = {
    acousticness: scoreFeature(
      features.acousticness,
      weights.acousticness,
      parameters.acousticness
    ),
    danceability: scoreFeature(
      features.danceability,
      weights.danceability,
      parameters.danceability
    ),
    energy: scoreFeature(features.energy, weights.energy, parameters.energy),
    instrumentalness: scoreFeature(
      features.instrumentalness,
      weights.instrumentalness
    ),
    tempo: scoreFeature(features.tempo, weights.tempo, parameters.tempo),
    valence: scoreFeature(
      features.valence,
      weights.valence,
      parameters.valence
    ),
  };

  // Sum weighted scores
  for (const [feature, weight] of Object.entries(weights)) {
    totalScore += scores[feature as keyof typeof scores];
    totalWeight += weight.weight;
  }

  // Normalize final score to 0-1 range
  return totalScore / totalWeight;
}
