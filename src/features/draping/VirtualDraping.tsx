import { moveColour } from "./reorder";
import { FABRICS } from "./fabrics";
import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import type { Season } from "../seasons/seasons";
import { DEFAULT_DRAPE_SETTINGS, drapeStyle, drapePosition, type DrapeSettings, type FabricFinish, type DrapeDirection } from "./drapeStyles";

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
        {showDrape && (settings.direction === "bottom" ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute border-t-4 border-white/40"
            style={{ ...drapeStyle(colour, settings), ...drapePosition("bottom", settings.coverage) }}
          />
        ) : (
          <>
            {(["left", "right"] as const).map((side) => (
              <div
                key={side}
                aria-hidden="true"
                className="pointer-events-none absolute border-white/40"
                style={{ ...drapeStyle(colour, settings), ...drapePosition(settings.direction, settings.coverage, side) }}
              />
            ))}
          </>
        ))}
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
  const activeColour = useRef<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  function dragStart(event: PointerEvent<HTMLButtonElement>, colour: string) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activeColour.current = colour;
    setDragging(colour);
  }

  function dragMove(event: PointerEvent<HTMLButtonElement>) {
    const colour = activeColour.current;
    if (!colour) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-palette-colour]");
    if (!(target instanceof HTMLElement)) return;
    const destination = target.dataset.paletteColour;
    if (!destination || destination === colour) return;
    setColours((current) => {
      const from = current.indexOf(colour);
      const to = current.indexOf(destination);
      return moveColour(current, from, to);
    });
  }

  function dragEnd() {
    activeColour.current = null;
    setDragging(null);
  }

  function reorderWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setColours((current) => moveColour(current, index, index + (event.key === "ArrowLeft" ? -1 : 1)));
  }
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
          Drape placement
          <select
            value={settings.direction}
            className="mt-2 w-full rounded-lg border border-[#bbb3b1] bg-white p-2"
            onChange={(event) => setSettings((current) => ({ ...current, direction: event.target.value as DrapeDirection }))}
          >
            <option value="bottom">From the bottom</option>
            <option value="sides">From the sides</option>
            <option value="angled">From the sides at an angle</option>
          </select>
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
      <p className="mt-4 text-sm text-[#6d6870]">All {colours.length} palette colours are shown. Drag the grip on a preview to rearrange the palette. Other previews shift into place as you drag. Use left/right arrow keys on a focused grip for keyboard access.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {colours.map((colour, index) => (
          <div
            key={colour}
            data-palette-colour={colour}
            className={`relative min-w-0 rounded-xl border border-[#ded8d2] p-2 transition-[transform,background-color,box-shadow] duration-150 ${dragging === colour ? "z-10 scale-[1.03] bg-[#f3ede8] shadow-lg" : ""}`}
          >
            <Portrait image={image} colour={colour} label={`Portrait with drape ${colour}`} showDrape={showDrape} settings={settings} />
            <span className="mt-2 block text-xs text-[#6d6870]">Preview {index + 1}</span>
            <button
              type="button"
              aria-label={`Reorder ${colour}; drag or use left and right arrow keys`}
              onPointerDown={(event) => dragStart(event, colour)}
              onPointerMove={dragMove}
              onPointerUp={dragEnd}
              onPointerCancel={dragEnd}
              onKeyDown={(event) => reorderWithKeyboard(event, index)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-grab touch-none select-none items-center justify-center rounded-full bg-white/80 text-xl text-[#282536] shadow-sm backdrop-blur-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#282536] active:cursor-grabbing"
            >
              <span aria-hidden="true">⠿</span>
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="mt-4 text-sm underline" onClick={() => setColours([...season.palette])}>Reset preview order</button>
    </section>
  );
}
