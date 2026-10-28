import { describe, expect, it } from "vitest";
import { FABRICS, fabricPattern } from "./fabrics";

describe("fabric library", () => {
  it("provides unique named finishes", () => {
    expect(new Set(FABRICS.map((fabric) => fabric.id)).size).toBe(FABRICS.length);
  });
  it("uses flat colour for solid and a pattern for each texture", () => {
    expect(fabricPattern("solid")).toBe("none");
    for (const fabric of FABRICS.filter((item) => item.id !== "solid")) {
      expect(fabricPattern(fabric.id)).toContain("gradient");
    }
  });
});
