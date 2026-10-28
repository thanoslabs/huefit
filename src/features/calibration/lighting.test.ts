import { describe, expect, it } from "vitest";
import { applyLighting, DEFAULT_LIGHTING, estimateWhiteBalance, inspectLighting } from "./lighting";

function image(r: number, g: number, b: number): ImageData {
  return { width: 1, height: 1, data: new Uint8ClampedArray([r, g, b, 255]), colorSpace: "srgb" } as ImageData;
}

describe("lighting calibration", () => {
  it("detects dark and clipped photographs", () => {
    expect(inspectLighting(image(0, 0, 0)).warnings.length).toBeGreaterThan(0);
    expect(inspectLighting(image(255, 255, 255)).clippedFraction).toBe(1);
  });
  it("estimates a conservative correction", () => {
    const result = estimateWhiteBalance(image(180, 140, 100));
    expect(result.temperature).toBeLessThan(0);
    expect(result.temperature).toBeGreaterThanOrEqual(-20);
  });
  it("does not mutate source pixels", () => {
    const source = image(100, 120, 140);
    const before = Array.from(source.data);
    const output = applyLighting(source, { ...DEFAULT_LIGHTING, exposure: 1 });
    expect(Array.from(source.data)).toEqual(before);
    expect(output.data[0]).toBe(200);
  });
});
