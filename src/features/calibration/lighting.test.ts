import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  vi.stubGlobal("ImageData", class {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  });
});
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
