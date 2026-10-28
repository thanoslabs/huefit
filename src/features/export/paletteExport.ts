import type { Season } from "../seasons/seasons";

export function paletteCsv(season: Season): string {
  return ["Season,Colour", ...season.palette.map((hex) => `"${season.name}","${hex}"`)].join("\r\n") + "\r\n";
}

export function paletteSvg(season: Season): string {
  const colours = season.palette;
  const width = 720;
  const swatchWidth = width / Math.max(colours.length, 1);
  const safeName = season.name.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const rectangles = colours.map((hex, index) =>
    `<rect x="${index * swatchWidth}" y="80" width="${swatchWidth}" height="160" fill="${hex}"/>`
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="280" viewBox="0 0 720 280"><rect width="720" height="280" fill="#f7f4ef"/><text x="24" y="52" font-size="28" font-family="sans-serif" fill="#282536">${safeName}</text>${rectangles}</svg>`;
}

export function downloadPalette(filename: string, contents: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
