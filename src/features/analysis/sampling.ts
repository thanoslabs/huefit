export type Point = { x: number; y: number };
export type RGB = { r: number; g: number; b: number };
export type SampleResult = { color: RGB; accepted: number; rejected: number };
export const DEFAULT_POINTS: Point[] = [
  { x: 0.36, y: 0.48 },
  { x: 0.64, y: 0.48 },
  { x: 0.5, y: 0.68 },
];

export function sampleSkin(
  image: ImageData,
  point: Point,
  radius = 12,
): SampleResult | null {
  if (
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    point.x < 0 ||
    point.x > 1 ||
    point.y < 0 ||
    point.y > 1
  ) return null;

  const cx = Math.min(image.width - 1, Math.floor(point.x * image.width));
  const cy = Math.min(image.height - 1, Math.floor(point.y * image.height));
  const values: RGB[] = [];
  let rejected = 0;

  for (let y = Math.max(0, cy - radius); y <= Math.min(image.height - 1, cy + radius); y++) {
    for (let x = Math.max(0, cx - radius); x <= Math.min(image.width - 1, cx + radius); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > radius ** 2) continue;
      const i = (y * image.width + x) * 4;
      const r = image.data[i], g = image.data[i + 1], b = image.data[i + 2], a = image.data[i + 3];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (a < 250 || max >= 248 || max <= 22 || max - min > 130) {
        rejected++;
        continue;
      }
      values.push({ r, g, b });
    }
  }

  if (values.length === 0) return null;
  const median = (channel: keyof RGB) => {
    const sorted = values.map((v) => v[channel]).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  return { color: { r: median("r"), g: median("g"), b: median("b") }, accepted: values.length, rejected };
}

export function rgbToHex(color: RGB): string {
  return "#" + [color.r, color.g, color.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}
