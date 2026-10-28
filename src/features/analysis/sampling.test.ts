import { describe, expect, it } from "vitest";
import { rgbToHex, sampleSkin } from "./sampling";

const photo = (width: number, height: number, pixels: number[]): ImageData => ({
  width,
  height,
  data: new Uint8ClampedArray(pixels),
  colorSpace: "srgb",
}) as ImageData;

describe("colour sampling", () => {
  it("returns a stable sample from a valid patch", () => {
    const result = sampleSkin(photo(2, 2, Array(4).fill([120, 100, 90, 255]).flat()), { x: 0.5, y: 0.5 }, 1);
    expect(result?.color).toEqual({ r: 120, g: 100, b: 90 });
    expect(rgbToHex(result!.color)).toBe("#78645a");
  });
  it("rejects clipped pixels", () => {
    expect(sampleSkin(photo(1, 1, [255, 255, 255, 255]), { x: 0.5, y: 0.5 })).toBeNull();
  });
  it("rejects points outside the image", () => {
    expect(sampleSkin(photo(1, 1, [120, 100, 90, 255]), { x: -0.2, y: 0.5 })).toBeNull();
  });
  it("uses median to reduce the influence of outliers", () => {
    const pixels = [[100, 90, 80, 255], [100, 90, 80, 255], [200, 180, 170, 255]].flat();
    expect(sampleSkin(photo(3, 1, pixels), { x: 0.5, y: 0.5 }, 2)?.color).toEqual({ r: 100, g: 90, b: 80 });
  });
});
