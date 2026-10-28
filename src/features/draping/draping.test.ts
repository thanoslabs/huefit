import { describe, expect, it } from "vitest";
import { initialDrapingPair, isPaletteColour } from "./draping";
import { SEASONS } from "../seasons/seasons";

describe("draping selections", () => {
  it("starts with two colours from the chosen season", () => {
    const season = SEASONS[0];
    const pair = initialDrapingPair(season);
    expect(isPaletteColour(pair.left, season)).toBe(true);
    expect(isPaletteColour(pair.right, season)).toBe(true);
  });
  it("rejects colours outside the palette", () => {
    expect(isPaletteColour("#000000", SEASONS[0])).toBe(false);
  });
});
