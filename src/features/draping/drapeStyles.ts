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

export function drapePosition(direction: DrapeDirection) {
  switch (direction) {
    case "sides":
      return { inset: "0", height: "100%", clipPath: "polygon(0 0, 24% 0, 24% 100%, 0 100%, 76% 0, 100% 0, 100% 100%, 76% 100%)", borderRadius: "0" };
    case "angled":
      return { inset: "0", height: "100%", clipPath: "polygon(0 12%, 40% 100%, 0 100%, 100% 12%, 100% 100%, 60% 100%)", borderRadius: "0" };
    default:
      return { left: "0", right: "0", bottom: "0", borderRadius: "45% 45% 0 0" };
  }
}
