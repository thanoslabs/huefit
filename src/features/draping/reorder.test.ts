import { describe, expect, it } from "vitest";
import { moveColour } from "./reorder";

describe("reorder drape previews", () => {
  it("moves a colour without losing or duplicating it", () => {
    expect(moveColour(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  });
  it("ignores invalid moves", () => {
    expect(moveColour(["a", "b"], -1, 1)).toEqual(["a", "b"]);
  });
});
