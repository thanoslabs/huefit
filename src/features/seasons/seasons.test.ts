import { describe, expect, it } from "vitest";
import { extractFeatures, rankSeasons, SEASONS } from "./seasons";

describe("12-season exploratory ranking", () => {
  it("contains twelve distinct palettes", () => {
    expect(SEASONS).toHaveLength(12);
    expect(new Set(SEASONS.map((s) => s.id)).size).toBe(12);
    expect(SEASONS.every((s) => s.palette.length >= 5)).toBe(true);
  });
  it("rejects missing or invalid samples", () => {
    expect(rankSeasons([])).toBeNull();
    expect(rankSeasons([{ r: 300, g: 0, b: 0 }])).toBeNull();
  });
  it("ranks all seasons deterministically", () => {
    const input = [{ r: 185, g: 145, b: 110 }];
    expect(rankSeasons(input)?.ranked).toHaveLength(12);
    expect(rankSeasons(input)?.ranked).toEqual(rankSeasons(input)?.ranked);
  });
  it("extracts lightness and chroma in bounded ranges", () => {
    const features = extractFeatures([{ r: 128, g: 128, b: 128 }]);
    expect(features?.chroma).toBe(0);
    expect(features!.lightness).toBeGreaterThan(0);
    expect(features!.lightness).toBeLessThan(1);
  });
});
