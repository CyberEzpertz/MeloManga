import { z } from "zod";

export const MoodType = z.enum([
  "serene",
  "tense",
  "melancholic",
  "action",
  "romantic",
  "whimsical",
  // "hopeful",
]);

export type Mood = z.infer<typeof MoodType>;

export const moodToSeedSongs: Record<Mood, string[]> = {
  serene: [
    "5R6jJiQXA866TsPs3xtaAK", // Nakama
    "6AFkv6rIVRusZNifR74Q7t", // Shingeki GT
    "3k637XK6FXDQy2kmn892z7", // Ochibabune
    "7aHAkZyl07HbAPNLGshCB9", // Suzume
    "5L9MJsGqzTRD09rSzHkCDy", // Home
  ],
  tense: [
    "1x2uye0yok42ce8EjRZCil", // GATE OF STEINER
    "0szhcYBMoNDyH5UAriWUKN", // A Murder of Crows
    "4aB5opnzeKNjk4XIcSo3gn", // MORPHO
    "5jrIk6jLrhvscjgPH3b31Z", // Hyouri
    "1gVN2TuTQh2g9LE1wi6FTY", // Girei (Pain’s Theme)
  ],
  melancholic: [
    "5FUUGPgA1J5QCkdfnhfeCB", // Surechigau Kokoro to Kokoro
    "4XbWSZ1Kp5I5NescINVN6V", // Neath Dark Waters
    "2k00f8Wu5dp8ghDXUfcg6b", // MHA Random Song
    "2XnI5n569R4tAb9QvI0wkF", // Video essay song
  ],
  action: [
    "6ecrP5i79ognSteH3UYtfz", // Velt Leen
    "2NTrPafNIYUvqGaG5JcOjH", // REGINLEIF
    "7q2voLm7RirWQGgfk7W35m", // TORI ON HEY SHOUKAN
    "75NMYcYoqqwFH7ixp6cc2H", // Contact With You
    "5PjdpjCXjN48yvc4SIhIGi", // Five
  ],
  romantic: [
    "7FBMpSs6CNpzBm1Jbbgex0", // Uso to Honto
    "4WedBZTeFawYCBCgfj36iK", // Katawaredoki
    "0NZEHy9ihAmdldI94Q9pGk", // Kirameki (Your Lie in April)
    "3W2fl3P4T8a034exQmfNoT", // Sparkle Instrumental
  ],
  whimsical: [
    "62EGUED22fAnvQbS7gBxRi", // MISATO
    "5ASxwnS9Y1EwxBsA9qmOV8", // Sutekimeppou
    "1ngJEe74iWtd70uh6k0WTB", // Cycle
    "5d5W8gq0WNnPi2cVifNBp9", // Noisy Times
    "26lWYpgbcknITI0Fy1eZDs", // Sans.
  ],
  // hopeful: [
  //   "0hHc2igYYlSUyZdByauJmB", // You Say Run
  //   "115Nh6Xv3Di4quT0qFOzHe", // Hope is the Thing With Feather
  //   "6fpqv9hCM0SKkvXnYYKS1n", // Beautiful Rain
  //   "6JJBe5yF37zbSzfqw4qCV8", // Orange OST
  // ],
};
