import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, validateDimensions, validateImage } from "./image";

describe("photo validation", () => {
  it("accepts supported images", () => {
    expect(validateImage(new File(["data"], "portrait.png", { type: "image/png" }))).toBeNull();
  });
  it("rejects unsupported and empty images", () => {
    expect(validateImage(new File(["x"], "portrait.svg", { type: "image/svg+xml" }))).toBeTruthy();
    expect(validateImage(new File([], "portrait.jpg", { type: "image/jpeg" }))).toBeTruthy();
  });
  it("rejects oversized images", () => {
    expect(validateImage(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "big.jpg", { type: "image/jpeg" }))).toBeTruthy();
  });
  it("rejects invalid dimensions", () => {
    expect(validateDimensions(0, 400)).toBeTruthy();
    expect(validateDimensions(6000, 5000)).toBeTruthy();
    expect(validateDimensions(1000, 1000)).toBeNull();
  });
});
