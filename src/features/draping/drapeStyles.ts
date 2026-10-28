export type FabricFinish = "solid" | "linen" | "satin";

export type DrapeSettings = {
  opacity: number;
  coverage: number;
  finish: FabricFinish;
};

export const DEFAULT_DRAPE_SETTINGS: DrapeSettings = {
  opacity: 100,
  coverage: 30,
  finish: "solid",
};

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function drapeStyle(colour: string, settings: DrapeSettings) {
  const opacity = clampPercent(settings.opacity) / 100;
  const coverage = clampPercent(settings.coverage);
  const pattern =
    settings.finish === "linen"
      ? "repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.12) 1px, transparent 3px, transparent 7px)"
      : settings.finish === "satin"
        ? "linear-gradient(115deg, rgba(255,255,255,0.35), transparent 35%, rgba(0,0,0,0.12) 65%, rgba(255,255,255,0.2))"
        : "none";

  return {
    backgroundColor: colour,
    backgroundImage: pattern,
    opacity,
    height: `${coverage}%`,
  };
}
