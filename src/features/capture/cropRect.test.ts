import { describe, expect, it } from "vitest";
import { cropRect } from "./cropRect";

describe("live crop rectangle", () => {
  it("centres a square crop at default zoom", () => {
    expect(cropRect(1200, 800, { zoom: 1, x: 0.5, y: 0.5 })).toEqual({ left: 200, top: 0, side: 800 });
  });
  it("clamps the preview to image boundaries", () => {
    expect(cropRect(1200, 800, { zoom: 2, x: 0, y: 1 })).toEqual({ left: 0, top: 400, side: 400 });
  });
});
