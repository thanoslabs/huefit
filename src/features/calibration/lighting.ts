export type LightingSettings = { exposure: number; temperature: number; tint: number };
export const DEFAULT_LIGHTING: LightingSettings = { exposure: 0, temperature: 0, tint: 0 };
export type LightingQuality = { meanLuminance: number; darkFraction: number; clippedFraction: number; warnings: string[] };

const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

export function inspectLighting(data: ImageData): LightingQuality {
  let total = 0;
  let dark = 0;
  let clipped = 0;
  const pixels = data.data.length / 4;
  for (let i = 0; i < data.data.length; i += 4) {
    const luminance = 0.2126 * data.data[i] + 0.7152 * data.data[i + 1] + 0.0722 * data.data[i + 2];
    total += luminance;
    if (luminance < 35) dark++;
    if (luminance > 245) clipped++;
  }
  const meanLuminance = pixels ? total / pixels : 0;
  const darkFraction = pixels ? dark / pixels : 0;
  const clippedFraction = pixels ? clipped / pixels : 0;
  const warnings: string[] = [];
  if (meanLuminance < 70) warnings.push("This photo looks dark; consider brighter, even daylight.");
  if (meanLuminance > 205) warnings.push("This photo looks very bright; consider softer lighting.");
  if (darkFraction > 0.3) warnings.push("Large dark areas may reduce colour accuracy.");
  if (clippedFraction > 0.1) warnings.push("Some highlights may have lost colour detail.");
  return { meanLuminance, darkFraction, clippedFraction, warnings };
}

/** Conservative grey-world estimate. Not a skin-neutralization algorithm. */
export function estimateWhiteBalance(data: ImageData): LightingSettings {
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.data.length; i += 16) {
    const red = data.data[i], green = data.data[i + 1], blue = data.data[i + 2];
    const brightness = (red + green + blue) / 3;
    if (brightness < 45 || brightness > 230) continue;
    r += red; g += green; b += blue; count++;
  }
  if (!count) return { ...DEFAULT_LIGHTING };
  r /= count; g /= count; b /= count;
  // Limit the correction to avoid over-neutralizing naturally warm skin.
  return {
    exposure: 0,
    temperature: Math.max(-20, Math.min(20, (b - r) / 5)),
    tint: Math.max(-15, Math.min(15, ((r + b) / 2 - g) / 5)),
  };
}

export function applyLighting(source: ImageData, settings: LightingSettings): ImageData {
  const output = new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
  const gain = 2 ** settings.exposure;
  for (let i = 0; i < output.data.length; i += 4) {
    output.data[i] = clamp((source.data[i] + settings.temperature * 0.7 + settings.tint * 0.25) * gain);
    output.data[i + 1] = clamp((source.data[i + 1] - settings.tint * 0.5) * gain);
    output.data[i + 2] = clamp((source.data[i + 2] - settings.temperature * 0.7 + settings.tint * 0.25) * gain);
  }
  return output;
}
