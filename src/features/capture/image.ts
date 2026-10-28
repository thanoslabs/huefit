import { cropRect } from "./cropRect";
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 24_000_000;
export const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImage(file: File): string | null {
  if (!SUPPORTED_TYPES.includes(file.type)) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size === 0) return "The selected image is empty.";
  if (file.size > MAX_IMAGE_BYTES) return "Choose an image smaller than 15 MB.";
  return null;
}

export function validateDimensions(width: number, height: number): string | null {
  if (!width || !height || width * height > MAX_IMAGE_PIXELS)
    return "This image is too large or could not be decoded.";
  return null;
}

export type Crop = { zoom: number; x: number; y: number };

/** Crop to a square, centered at normalized image coordinates x/y, without upscaling. */
export function cropToCanvas(
  image: HTMLImageElement,
  crop: Crop,
  outputSize = 1024,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas rendering is unavailable.");
  const { left, top, side } = cropRect(image.naturalWidth, image.naturalHeight, crop);
  ctx.drawImage(image, left, top, side, side, 0, 0, outputSize, outputSize);
  return canvas;
}
