import { useEffect, useRef, useState } from "react";
import { applyLighting, DEFAULT_LIGHTING, estimateWhiteBalance, inspectLighting, type LightingSettings } from "./lighting";

type Props = { source: string; onBack: () => void };

export default function LightingCalibration({ source, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<ImageData | null>(null);
  const [settings, setSettings] = useState<LightingSettings>(DEFAULT_LIGHTING);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });
      if (!canvas || !ctx) { setError("Canvas is unavailable."); return; }
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);
      try {
        const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
        originalRef.current = original;
        setWarnings(inspectLighting(original).warnings);
        setSettings(estimateWhiteBalance(original));
      } catch { setError("Unable to read photo pixels."); }
    };
    image.onerror = () => { if (!cancelled) setError("Unable to load the prepared photo."); };
    image.src = source;
    return () => { cancelled = true; originalRef.current = null; image.src = ""; };
  }, [source]);

  useEffect(() => {
    const original = originalRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!original || !ctx) return;
    ctx.putImageData(showOriginal ? original : applyLighting(original, settings), 0, 0);
  }, [settings, showOriginal]);

  function control(label: string, key: keyof LightingSettings, min: number, max: number, step: number) {
    return (
      <label className="mt-4 block" key={key}>
        <span className="flex justify-between"><span>{label}</span><span>{settings[key].toFixed(1)}</span></span>
        <input className="mt-2 w-full" type="range" min={min} max={max} step={step} value={settings[key]} onChange={(e) => setSettings((current) => ({ ...current, [key]: Number(e.target.value) }))} />
      </label>
    );
  }

  return (
    <section className="mx-auto w-full max-w-xl py-10" aria-label="Lighting calibration">
      <button type="button" className="mb-6 text-sm underline" onClick={onBack}>← Adjust crop</button>
      <h2 className="text-3xl font-semibold">Adjust your lighting</h2>
      <p className="mt-3 text-[#6d6870]">Automatic correction is an estimate. For best results, use even daylight and adjust the image until colours look natural.</p>
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      {warnings.map((warning) => <p role="status" key={warning} className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{warning}</p>)}
      <canvas ref={canvasRef} className="mx-auto mt-6 max-h-96 w-full rounded-lg object-contain" aria-label={showOriginal ? "Original photo" : "Lighting-adjusted photo"} role="img" />
      <label className="mt-4 flex items-center gap-2"><input type="checkbox" checked={showOriginal} onChange={(e) => setShowOriginal(e.target.checked)} /> Show original</label>
      {control("Exposure (EV)", "exposure", -2, 2, 0.1)}
      {control("Temperature", "temperature", -100, 100, 1)}
      {control("Tint", "tint", -100, 100, 1)}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="rounded-full border border-[#bbb3b1] px-5 py-3" onClick={() => { const original = originalRef.current; if (original) setSettings(estimateWhiteBalance(original)); }}>Auto estimate</button>
        <button type="button" className="rounded-full border border-[#bbb3b1] px-5 py-3" onClick={() => setSettings(DEFAULT_LIGHTING)}>Reset</button>
      </div>
      <p className="mt-6 text-sm text-[#6d6870]">Your original photo is preserved in memory. Seasonal analysis will be added in a later PR.</p>
    </section>
  );
}
