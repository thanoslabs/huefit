import { moveColour } from "./reorder";
import { FABRICS } from "./fabrics";
import { useEffect, useRef, useState } from "react";
import type { Season } from "../seasons/seasons";
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
  const [colours, setColours] = useState<string[]>(() => [...season.palette]);
  const dragIndex = useRef<number | null>(null);
  const [showDrape, setShowDrape] = useState(true);
  const [settings, setSettings] = useState<DrapeSettings>(DEFAULT_DRAPE_SETTINGS);

  // Remounting this component when the season changes resets both selections.
  return (
    <section className="mt-8" aria-label="Virtual draping comparison">
      <h3 className="text-xl font-semibold">Compare virtual drapes</h3>
      <p className="mt-2 text-sm text-[#6d6870]">
        Compare every colour in your seasonal palette against the same portrait. Drapes are illustrative overlays, not clothing segmentation. Fabric finishes are visual approximations, not physically accurate simulations.
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
      <p className="mt-4 text-sm text-[#6d6870]">All {colours.length} palette colours are shown. Drag cards to rearrange them, or use the arrow buttons with a keyboard.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {colours.map((colour, index) => (
          <div
            key={colour}
            draggable
            onDragStart={(event) => {
              dragIndex.current = index;
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(index));
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const from = dragIndex.current;
              if (from !== null) setColours((current) => moveColour(current, from, index));
              dragIndex.current = null;
            }}
            onDragEnd={() => { dragIndex.current = null; }}
            className="min-w-0 rounded-xl border border-[#ded8d2] p-2"
          >
            <Portrait image={image} colour={colour} label={`Portrait with drape ${colour}`} showDrape={showDrape} settings={settings} />
            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="text-xs text-[#6d6870]">Preview {index + 1}</span>
              <div className="flex gap-1">
                <button type="button" disabled={index === 0} aria-label={`Move ${colour} left`} className="rounded border px-2 py-1 text-sm disabled:opacity-30" onClick={() => setColours((current) => moveColour(current, index, index - 1))}>←</button>
                <button type="button" disabled={index === colours.length - 1} aria-label={`Move ${colour} right`} className="rounded border px-2 py-1 text-sm disabled:opacity-30" onClick={() => setColours((current) => moveColour(current, index, index + 1))}>→</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="mt-4 text-sm underline" onClick={() => setColours([...season.palette])}>Reset preview order</button>
    </section>
  );
}
