import { describe, expect, it } from "vitest";
import { samplingPointsFromFaces } from "./landmarks";

const face = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));

describe("face sampling landmarks", () => {
  it("returns three points for one face", () => {
    expect(samplingPointsFromFaces([face])?.points).toHaveLength(3);
  });
  it("rejects missing or multiple faces", () => {
    expect(samplingPointsFromFaces([])).toBeNull();
    expect(samplingPointsFromFaces([face, face])).toBeNull();
  });
  it("rejects out-of-frame landmarks", () => {
    const bad = face.map((point) => ({ ...point }));
    bad[205] = { x: -0.1, y: 0.5 };
    expect(samplingPointsFromFaces([bad])).toBeNull();
  });
});
