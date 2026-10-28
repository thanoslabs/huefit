import { fabricPattern, type Fabric } from "./fabrics";
export type FabricFinish = Fabric;
export type DrapeDirection = "bottom" | "sides" | "angled";

export type DrapeSettings = {
  opacity: number;
  coverage: number;
  finish: FabricFinish;
  direction: DrapeDirection;
};

export const DEFAULT_DRAPE_SETTINGS: DrapeSettings = {
  opacity: 100,
  coverage: 30,
  finish: "solid",
  direction: "bottom",
};

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function drapeStyle(colour: string, settings: DrapeSettings) {
  const opacity = clampPercent(settings.opacity) / 100;
  const coverage = clampPercent(settings.coverage);
  const pattern = fabricPattern(settings.finish);

  return {
    backgroundColor: colour,
    backgroundImage: pattern,
    opacity,
    height: `${coverage}%`,
  };
}

export function drapePosition(direction: DrapeDirection, coverage: number, side: "left" | "right" = "left") {
  if (direction === "bottom") {
    return { left: "0", right: "0", bottom: "0", borderRadius: "45% 45% 0 0" };
  }
  const width = Math.min(50, Math.max(15, coverage));
  return {
    top: "0",
    bottom: "0",
    width: `${width}%`,
    height: "100%",
    left: side === "left" ? "0" : undefined,
    right: side === "right" ? "0" : undefined,
    clipPath: direction === "angled"
      ? (side === "left" ? "polygon(0 0, 100% 100%, 0 100%)" : "polygon(100% 0, 100% 100%, 0 100%)")
      : undefined,
  };
}
