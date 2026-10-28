import { describe, expect, it } from "vitest";
import { SEASONS } from "../seasons/seasons";
import { paletteCsv, paletteSvg } from "./paletteExport";

describe("local palette exports", () => {
  it("includes the selected season and its colours in CSV", () => {
    const season = SEASONS[0];
    const csv = paletteCsv(season);
    expect(csv).toContain(season.name);
    expect(csv).toContain(season.palette[0]);
  });

  it("generates a standalone SVG with the selected palette", () => {
    const season = SEASONS[0];
    const svg = paletteSvg(season);
    expect(svg).toContain("<svg");
    expect(svg).toContain(season.palette[0]);
    expect(svg).not.toContain("data:image");
  });
});
