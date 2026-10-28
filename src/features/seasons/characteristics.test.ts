import { describe, expect, it } from "vitest";
import { SEASONS } from "./seasons";
import { adjustSeasonRanking, DEFAULT_CHARACTERISTICS } from "./characteristics";

const ranked = SEASONS.map((season) => ({ season, score: 0.5 }));

describe("manual characteristic ranking", () => {
  it("preserves the baseline scores when automatic", () => {
    expect(adjustSeasonRanking(ranked, DEFAULT_CHARACTERISTICS).every(({ score }) => score === 0.5)).toBe(true);
  });
  it("prioritizes user-selected attributes without changing source data", () => {
    const adjusted = adjustSeasonRanking(ranked, { undertone: "cool", depth: "deep", chroma: "auto" });
    expect(adjusted[0].season.id).toBe("deep-winter");
    expect(ranked[0].score).toBe(0.5);
  });
});
