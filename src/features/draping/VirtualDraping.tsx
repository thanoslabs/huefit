import { FABRICS } from "./fabrics";
import { useEffect, useRef, useState } from "react";
import type { Season } from "../seasons/seasons";
import { initialDrapingPair } from "./draping";
import { DEFAULT_DRAPE_SETTINGS, drapeStyle, type DrapeSettings, type FabricFinish } from "./drapeStyles";

type Props = { image: ImageData; season: Season };

function Portrait({ image, colour, label, showDrape, settings }: { image: ImageData; colour: string; label: string; showDrape: boolean; settings: DrapeSettings }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d")?.putImageData(image, 0, 0);
  }, [image]);

  return (
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-xl">
        <canvas ref={canvasRef} role="img" aria-label={label} className="block w-full" />
        {showDrape && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] rounded-t-[45%] border-t-4 border-white/40"
            style={drapeStyle(colour, settings)}
          />
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="h-5 w-5 shrink-0 rounded border" style={{ backgroundColor: colour }} />
        <span>{colour}</span>
      </div>
    </div>
  );
}

export default function VirtualDraping({ image, season }: Props) {
  const defaults = initialDrapingPair(season);
  const [left, setLeft] = useState(defaults.left);
  const [right, setRight] = useState(defaults.right);
  const [showDrape, setShowDrape] = useState(true);
  const [settings, setSettings] = useState<DrapeSettings>(DEFAULT_DRAPE_SETTINGS);

  // Remounting this component when the season changes resets both selections.
  return (
    <section className="mt-8" aria-label="Virtual draping comparison">
      <h3 className="text-xl font-semibold">Compare virtual drapes</h3>
      <p className="mt-2 text-sm text-[#6d6870]">
        Compare two colours against the same portrait. Drapes are illustrative overlays, not clothing segmentation. Fabric finishes are visual approximations, not physically accurate simulations.
      </p>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showDrape} onChange={(event) => setShowDrape(event.target.checked)} />
        Show drapes
      </label>
      <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-[#ded8d2] p-4 sm:grid-cols-2">
        <label className="block text-sm">
          Drape opacity: {settings.opacity}%
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={settings.opacity}
            className="mt-2 w-full"
            onChange={(event) => setSettings((current) => ({ ...current, opacity: Number(event.target.value) }))}
          />
        </label>
        <label className="block text-sm">
          Portrait coverage: {settings.coverage}%
          <input
            type="range"
            min="15"
            max="55"
            step="5"
            value={settings.coverage}
            className="mt-2 w-full"
            onChange={(event) => setSettings((current) => ({ ...current, coverage: Number(event.target.value) }))}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          Fabric appearance
          <select
            value={settings.finish}
            className="mt-2 w-full rounded-lg border border-[#bbb3b1] bg-white p-2"
            onChange={(event) => setSettings((current) => ({ ...current, finish: event.target.value as FabricFinish }))}
          >
            {FABRICS.map((fabric) => <option key={fabric.id} value={fabric.id}>{fabric.label}</option>)}
          </select>
        </label>
        <p className="text-xs text-[#6d6870] sm:col-span-2">Fabric textures are illustrative CSS patterns, not measured physical material properties.</p>
        <button
          type="button"
          className="text-left text-sm underline sm:col-span-2"
          onClick={() => setSettings(DEFAULT_DRAPE_SETTINGS)}
        >
          Reset drape appearance
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Portrait image={image} colour={left} label="Left portrait comparison" showDrape={showDrape} settings={settings} />
        <Portrait image={image} colour={right} label="Right portrait comparison" showDrape={showDrape} settings={settings} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {([
          ["Left colour", left, setLeft],
          ["Right colour", right, setRight],
        ] as const).map(([label, value, update]) => (
          <label key={label} className="block text-sm">
            {label}
            <select
              className="mt-2 w-full rounded-lg border border-[#bbb3b1] bg-white p-2"
              value={value}
              onChange={(event) => update(event.target.value)}
            >
              {season.palette.map((hex) => (
                <option key={hex} value={hex}>{hex}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
