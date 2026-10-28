import { cropRect } from "./cropRect";
import LightingCalibration from "../calibration/LightingCalibration";
import { useEffect, useRef, useState } from "react";
import { cropToCanvas, validateDimensions, validateImage, type Crop } from "./image";

type Props = { onClose: () => void };

export default function PhotoCapture({ onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ zoom: 1, x: 0.5, y: 0.5 });
  const [preview, setPreview] = useState<string | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectFile(file?: File) {
    if (!file) return;
    const issue = validateImage(file);
    if (issue) { setError(issue); return; }
    setError(null);
    setPreview(null);
    setCalibrating(false);
    setCrop({ zoom: 1, x: 0.5, y: 0.5 });
    setDimensions(null);
    setUrl(URL.createObjectURL(file));
  }

  function cropPhoto() {
    const image = imageRef.current;
    if (!image) return;
    try {
      const canvas = cropToCanvas(image, crop);
      canvas.toBlob((blob) => {
        if (!blob) { setError("Unable to prepare the photo."); return; }
        setPreview(URL.createObjectURL(blob));
        setError(null);
      }, "image/jpeg", 0.9);
    } catch {
      setError("Unable to crop this image.");
    }
  }

  if (preview && calibrating) return <LightingCalibration source={preview} onBack={() => setCalibrating(false)} />;

  return (
    <section className="mx-auto w-full max-w-xl py-12" aria-label="Photo preparation">
      <button className="mb-8 text-sm underline" onClick={onClose} type="button">← Back</button>
      <h1 className="text-3xl font-semibold">Prepare your photo</h1>
      <p className="mt-3 text-[#6d6870]">Choose a clear, evenly lit portrait. Your photo stays in this browser session.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-full bg-[#282536] px-5 py-3 text-white" onClick={() => inputRef.current?.click()} type="button">Upload photo</button>
        <button className="rounded-full border border-[#bbb3b1] px-5 py-3" onClick={() => cameraRef.current?.click()} type="button">Take photo</button>
      </div>
      <input ref={inputRef} className="sr-only" aria-label="Upload portrait" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ""; }} />
      <input ref={cameraRef} className="sr-only" aria-label="Capture portrait" type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ""; }} />
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      {url && !preview && (
        <div className="mt-8">
          <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-lg">
          <img
            ref={imageRef}
            src={url}
            alt="Selected portrait for cropping"
            className="block max-h-80 max-w-full object-contain"
            onLoad={(event) => {
              const img = event.currentTarget;
              const issue = validateDimensions(img.naturalWidth, img.naturalHeight);
              if (issue) { setError(issue); setUrl(null); }
              else setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            }}
            onError={() => { setError("This image could not be decoded."); setUrl(null); }}
          />
          {dimensions && (() => {
            const rect = cropRect(dimensions.width, dimensions.height, crop);
            return (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                style={{
                  left: `${(rect.left / dimensions.width) * 100}%`,
                  top: `${(rect.top / dimensions.height) * 100}%`,
                  width: `${(rect.side / dimensions.width) * 100}%`,
                  height: `${(rect.side / dimensions.height) * 100}%`,
                }}
              >
                <div className="absolute inset-0 border border-black/30" />
              </div>
            );
          })()}
          </div>
          <p className="mt-4 text-sm text-[#6d6870]">The bright square shows exactly what will be cropped. Adjust zoom and position to update it live.</p>
          <label className="mt-4 block">Zoom: {crop.zoom.toFixed(1)}×
            <input className="mt-2 w-full" type="range" min="1" max="3" step="0.1" value={crop.zoom} onChange={(e) => setCrop({ ...crop, zoom: Number(e.target.value) })} />
          </label>
          <label className="mt-3 block">Horizontal position
            <input className="mt-2 w-full" type="range" min="0" max="1" step="0.01" value={crop.x} onChange={(e) => setCrop({ ...crop, x: Number(e.target.value) })} />
          </label>
          <label className="mt-3 block">Vertical position
            <input className="mt-2 w-full" type="range" min="0" max="1" step="0.01" value={crop.y} onChange={(e) => setCrop({ ...crop, y: Number(e.target.value) })} />
          </label>
          <button type="button" className="mt-5 rounded-full bg-[#282536] px-5 py-3 text-white" onClick={cropPhoto}>Preview crop</button>
        </div>
      )}
      {preview && (
        <div className="mt-8">
          <img src={preview} alt="Cropped portrait preview" className="mx-auto w-64 rounded-lg" />
          <p className="mt-4 text-sm text-[#6d6870]">Photo prepared locally. Next, check the lighting before analysis.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="rounded-full bg-[#282536] px-5 py-3 text-white" onClick={() => setCalibrating(true)}>Adjust lighting</button>
            <button type="button" className="rounded-full border border-[#bbb3b1] px-5 py-3" onClick={() => setPreview(null)}>Adjust crop</button>
          </div>
        </div>
      )}
    </section>
  );
}
