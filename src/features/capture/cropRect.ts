import type { Crop } from "./image";

export type CropRect = { left: number; top: number; side: number };

export function cropRect(width: number, height: number, crop: Crop): CropRect {
  const side = Math.min(width, height) / crop.zoom;
  return {
    side,
    left: Math.max(0, Math.min(width - side, crop.x * width - side / 2)),
    top: Math.max(0, Math.min(height - side, crop.y * height - side / 2)),
  };
}
