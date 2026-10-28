import { describe, expect, it } from "vitest";
import { clampPercent, drapeStyle, DEFAULT_DRAPE_SETTINGS } from "./drapeStyles";

describe("virtual drape appearance", () => {
  it("clamps opacity and coverage percentages", () => {
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(Number.NaN)).toBe(0);
  });

  it("uses default appearance values", () => {
    const style = drapeStyle("#abcdef", DEFAULT_DRAPE_SETTINGS);
    expect(style.backgroundColor).toBe("#abcdef");
    expect(style.opacity).toBe(1);
    expect(style.height).toBe("30%");
    expect(style.backgroundImage).toBe("none");
  });

  it("renders distinct illustrative fabric finishes", () => {
    const linen = drapeStyle("#abcdef", { opacity: 50, coverage: 40, finish: "linen" });
    const satin = drapeStyle("#abcdef", { opacity: 50, coverage: 40, finish: "satin" });
    expect(linen.opacity).toBe(0.5);
    expect(linen.height).toBe("40%");
    expect(linen.backgroundImage).not.toBe(satin.backgroundImage);
  });
});
