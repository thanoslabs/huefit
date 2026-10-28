import type { RGB } from "../analysis/sampling";

export type SeasonId =
  | "light-spring" | "warm-spring" | "bright-spring"
  | "light-summer" | "cool-summer" | "soft-summer"
  | "soft-autumn" | "warm-autumn" | "deep-autumn"
  | "deep-winter" | "cool-winter" | "bright-winter";

export type Season = {
  id: SeasonId;
  name: string;
  undertone: "warm" | "cool";
  depth: "light" | "medium" | "deep";
  chroma: "soft" | "balanced" | "bright";
  palette: readonly string[];
};

export const SEASONS: readonly Season[] = [
  { id: "light-spring", name: "Light Spring", undertone: "warm", depth: "light", chroma: "balanced", palette: ["#F5C7A9", "#F3D66E", "#A7D9BC", "#8CC5C6", "#E6A4A8"] },
  { id: "warm-spring", name: "Warm Spring", undertone: "warm", depth: "medium", chroma: "balanced", palette: ["#F6B04A", "#D8B44B", "#75AD78", "#E67F59", "#65B6B2"] },
  { id: "bright-spring", name: "Bright Spring", undertone: "warm", depth: "medium", chroma: "bright", palette: ["#FF704F", "#FFCB35", "#3CBF89", "#24B6C8", "#F45C94"] },
  { id: "light-summer", name: "Light Summer", undertone: "cool", depth: "light", chroma: "balanced", palette: ["#D7B6CF", "#AFC9E2", "#A9D6CD", "#E8C5D4", "#B5B6DB"] },
  { id: "cool-summer", name: "Cool Summer", undertone: "cool", depth: "medium", chroma: "balanced", palette: ["#B17EA7", "#6E91BB", "#76A6A3", "#BD8798", "#8888B8"] },
  { id: "soft-summer", name: "Soft Summer", undertone: "cool", depth: "medium", chroma: "soft", palette: ["#A58D9C", "#899DAF", "#91A79C", "#B69E9F", "#8E8DA1"] },
  { id: "soft-autumn", name: "Soft Autumn", undertone: "warm", depth: "medium", chroma: "soft", palette: ["#B89C7B", "#A6A273", "#C58F78", "#8E9B78", "#A58E82"] },
  { id: "warm-autumn", name: "Warm Autumn", undertone: "warm", depth: "medium", chroma: "balanced", palette: ["#C86F32", "#B18B2B", "#73833B", "#AF593F", "#467B71"] },
  { id: "deep-autumn", name: "Deep Autumn", undertone: "warm", depth: "deep", chroma: "balanced", palette: ["#7C3E2E", "#836A25", "#465B34", "#934D35", "#35605A"] },
  { id: "deep-winter", name: "Deep Winter", undertone: "cool", depth: "deep", chroma: "balanced", palette: ["#5D274E", "#214A76", "#155F60", "#8C294C", "#34335F"] },
  { id: "cool-winter", name: "Cool Winter", undertone: "cool", depth: "medium", chroma: "bright", palette: ["#C13B80", "#3568C1", "#248A9B", "#B62951", "#6555AE"] },
  { id: "bright-winter", name: "Bright Winter", undertone: "cool", depth: "medium", chroma: "bright", palette: ["#E12783", "#176FD0", "#05A9B5", "#D52852", "#6746D1"] },
];

export type ColourFeatures = { lightness: number; chroma: number; warmth: number };
export type RankedSeason = { season: Season; score: number };
export type SeasonAnalysis = { features: ColourFeatures; ranked: RankedSeason[]; reliability: "exploratory" };

export function extractFeatures(colours: readonly RGB[]): ColourFeatures | null {
  if (!colours.length || colours.some((c) => [c.r, c.g, c.b].some((v) => !Number.isFinite(v) || v < 0 || v > 255))) return null;
  let lightness = 0, chroma = 0, warmth = 0;
  for (const { r, g, b } of colours) {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    lightness += (max + min) / 2;
    chroma += max - min;
    // Red-blue balance is only a crude colour cast indicator, not a skin undertone test.
    warmth += (r - b) / 255;
  }
  return { lightness: lightness / colours.length, chroma: chroma / colours.length, warmth: warmth / colours.length };
}

export function rankSeasons(colours: readonly RGB[]): SeasonAnalysis | null {
  const features = extractFeatures(colours);
  if (!features) return null;
  const ranked = SEASONS.map((season) => {
    const depthTarget = season.depth === "light" ? 0.78 : season.depth === "deep" ? 0.25 : 0.51;
    const chromaTarget = season.chroma === "soft" ? 0.12 : season.chroma === "bright" ? 0.53 : 0.31;
    const warmthTarget = season.undertone === "warm" ? 0.23 : -0.07;
    const distance =
      Math.abs(features.lightness - depthTarget) * 1.2 +
      Math.abs(features.chroma - chromaTarget) +
      Math.abs(features.warmth - warmthTarget) * 0.5;
    return { season, score: Math.max(0, 1 - distance / 2) };
  }).sort((a, b) => b.score - a.score || a.season.name.localeCompare(b.season.name));
  return { features, ranked, reliability: "exploratory" };
}
