import SeasonResults from "../seasons/SeasonResults";
import { detectFaceSamplingPoints } from "./landmarks";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_POINTS, rgbToHex, sampleSkin, type Point, type SampleResult } from "./sampling";

type Props = { image: ImageData; onBack: () => void };

export default function ColourSampling({ image, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>(DEFAULT_POINTS);
  const [selected, setSelected] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState("Choose automatic detection or position points manually.");
  const samples: (SampleResult | null)[] = points.map((point) => sampleSkin(image, point));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx?.putImageData(image, 0, 0);
  }, [image]);

  async function autoDetect() {
    setDetecting(true);
    setDetectionMessage("Finding facial landmarks locally…");
    try {
      const result = await detectFaceSamplingPoints(image);
      if (result) {
        setPoints(result.points);
        setDetectionMessage("Three suggested points found. Review and adjust them to avoid hair, makeup, shadows, or highlights.");
      } else {
        setDetectionMessage("Could not identify exactly one clear face. Adjust points manually or try a different photo.");
      }
    } catch {
      setDetectionMessage("Automatic detection is unavailable. You can still position the points manually.");
    } finally {
      setDetecting(false);
    }
  }

  function reposition(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    setPoints((current) => current.map((point, index) => index === selected ? { x, y } : point));
  }

  if (showResults) return <SeasonResults colours={samples.filter((sample): sample is SampleResult => sample !== null).map((sample) => sample.color)} onBack={() => setShowResults(false)} />;

  return (
    <section className="mx-auto w-full max-w-xl py-10" aria-label="Colour sampling">
      <button type="button" className="mb-6 text-sm underline" onClick={onBack}>← Adjust lighting</button>
      <h2 className="text-3xl font-semibold">Sample your colours</h2>
      <p className="mt-3 text-[#6d6870]">Select a sample point, then click a clear area of skin in the photo to reposition it. Avoid makeup, highlights and shadows. Automatic suggestions are optional and can always be adjusted.</p>
      <button type="button" disabled={detecting} onClick={() => void autoDetect()} className="mt-5 rounded-full bg-[#282536] px-5 py-3 text-white disabled:opacity-50">{detecting ? "Detecting…" : "Detect face automatically"}</button>
      <p role="status" className="mt-3 text-sm text-[#6d6870]">{detectionMessage}</p>
      <div className="relative mx-auto mt-6 w-full max-w-md">
        <canvas ref={canvasRef} role="img" aria-label="Calibrated portrait; click to move the selected sample point" onClick={reposition} className="block w-full cursor-crosshair rounded-lg" />
        {points.map((point, index) => (
          <span key={index} aria-hidden="true" className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, backgroundColor: index === selected ? "#282536" : "#b87868" }} />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {points.map((point, index) => (
          <button key={index} type="button" aria-pressed={selected === index} className={`rounded-full border px-4 py-2 ${selected === index ? "border-[#282536] bg-[#282536] text-white" : "border-[#bbb3b1]"}`} onClick={() => setSelected(index)}>
            Sample {index + 1}
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {samples.map((sample, index) => (
          <div key={index} className="text-center text-sm">
            <div className="h-16 rounded-lg border border-[#bbb3b1]" style={{ backgroundColor: sample ? rgbToHex(sample.color) : "#ddd" }} />
            <p className="mt-2">{sample ? rgbToHex(sample.color) : "No valid sample"}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-[#6d6870]">These are sampled pixel colours. Results depend on lighting and the regions selected.</p>
      <button type="button" disabled={samples.every((sample) => sample === null)} className="mt-5 rounded-full bg-[#282536] px-5 py-3 text-white disabled:opacity-50" onClick={() => setShowResults(true)}>Explore seasonal palettes</button>
    </section>
  );
}
