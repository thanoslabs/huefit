import type { ColourFeatures, Season, RankedSeason } from "./seasons";

export type CharacteristicChoices = {
  undertone: Season["undertone"] | "auto";
  depth: Season["depth"] | "auto";
  chroma: Season["chroma"] | "auto";
};

export const DEFAULT_CHARACTERISTICS: CharacteristicChoices = {
  undertone: "auto",
  depth: "auto",
  chroma: "auto",
};

export function adjustSeasonRanking(ranked: readonly RankedSeason[], choices: CharacteristicChoices): RankedSeason[] {
  return ranked.map(({ season, score }) => {
    const mismatches = (choices.undertone !== "auto" && season.undertone !== choices.undertone ? 1 : 0)
      + (choices.depth !== "auto" && season.depth !== choices.depth ? 1 : 0)
      + (choices.chroma !== "auto" && season.chroma !== choices.chroma ? 1 : 0);
    return { season, score: score - mismatches };
  }).sort((a, b) => b.score - a.score || a.season.name.localeCompare(b.season.name));
}

export function describeFeatures(features: ColourFeatures): string {
  return `Measured photo colour: lightness ${Math.round(features.lightness * 100)}%, chroma ${Math.round(features.chroma * 100)}%. These are image measurements, not biological undertone measurements.`;
}
