import type { Season } from "../seasons/seasons";

export type DrapingPair = { left: string; right: string };

export function initialDrapingPair(season: Season): DrapingPair {
  return {
    left: season.palette[0] ?? "#888888",
    right: season.palette[1] ?? "#888888",
  };
}

export function isPaletteColour(value: string, season: Season): boolean {
  return season.palette.includes(value);
}
