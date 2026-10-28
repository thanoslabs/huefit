import { cropRect } from "./cropRect";
import LightingCalibration from "../calibration/LightingCalibration";
import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { cropToCanvas, validateDimensions, validateImage, type Crop } from "./image";

type Props = { onClose: () => void };

export default function PhotoCapture({ onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ zoom: 1, x: 0.5, y: 0.5 });
  const [preview, setPreview] = useState<string | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragRef = useRef<{ mode: "move" | "resize"; x: number; y: number; crop: Crop } | null>(null);

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

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => setError("Unable to start the camera preview."));
    }
  }, [cameraOpen]);

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable in this browser. Use Upload photo instead.");
      return;
    }
    setCameraBusy(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user" } });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setError("Camera access was blocked or no camera is available. Check browser permissions or upload a photo.");
    } finally {
      setCameraBusy(false);
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready yet. Try again in a moment.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) { setError("Unable to capture the camera image."); return; }
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) { setError("Unable to capture the photo."); return; }
      stopCamera();
      selectFile(new File([blob], "camera-photo.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  }

  function selectFile(file?: File) {
    if (!file) return;
    const issue = validateImage(file);
    if (issue) { setError(issue); return; }
    setError(null);
    setPreview(null);
    setCalibrating(false);
    stopCamera();
    setCrop({ zoom: 1, x: 0.5, y: 0.5 });
    setDimensions(null);
    setUrl(URL.createObjectURL(file));
  }

  function beginCropDrag(event: PointerEvent<HTMLDivElement>, mode: "move" | "resize") {
    if (!dimensions) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { mode, x: event.clientX, y: event.clientY, crop };
  }

  function updateCropDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const image = imageRef.current;
    if (!drag || !dimensions || !image) return;
    const bounds = image.getBoundingClientRect();
    const dx = (event.clientX - drag.x) / bounds.width;
    const dy = (event.clientY - drag.y) / bounds.height;
    if (drag.mode === "move") {
      const original = cropRect(dimensions.width, dimensions.height, drag.crop);
      const left = Math.max(0, Math.min(dimensions.width - original.side, original.left + dx * dimensions.width));
      const top = Math.max(0, Math.min(dimensions.height - original.side, original.top + dy * dimensions.height));
      setCrop({ ...drag.crop, x: (left + original.side / 2) / dimensions.width, y: (top + original.side / 2) / dimensions.height });
    } else {
      const original = cropRect(dimensions.width, dimensions.height, drag.crop);
      const side = Math.max(Math.min(dimensions.width, dimensions.height) / 3, Math.min(
        Math.min(dimensions.width, dimensions.height),
        original.side + Math.max(dx * dimensions.width, dy * dimensions.height),
      ));
      setCrop({ zoom: Math.min(dimensions.width, dimensions.height) / side, x: (original.left + side / 2) / dimensions.width, y: (original.top + side / 2) / dimensions.height });
    }
  }

  function nudgeCrop(event: KeyboardEvent<HTMLDivElement>) {
    if (!dimensions) return;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const rect = cropRect(dimensions.width, dimensions.height, crop);
    const step = event.shiftKey ? 0.05 : 0.01;
    const left = Math.max(0, Math.min(dimensions.width - rect.side, rect.left + offset[0] * step * dimensions.width));
    const top = Math.max(0, Math.min(dimensions.height - rect.side, rect.top + offset[1] * step * dimensions.height));
    setCrop((current) => ({ ...current, x: (left + rect.side / 2) / dimensions.width, y: (top + rect.side / 2) / dimensions.height }));
  }

  function cropPhoto() {
    const image = imageRef.current;
    if (!image) return;
    try {
      const canvas = cropToCanvas(image, crop);
      canvas.toBlob((blob) => {
        if (!blob) { setError("Unable to prepare the photo."); return; }
        setPreview(URL.createObjectURL(blob));
        setCalibrating(true);
        setError(null);
      }, "image/jpeg", 0.9);
    } catch {
      setError("Unable to crop this image.");
    }
  }

  if (preview && calibrating) return <LightingCalibration source={preview} onBack={() => setCalibrating(false)} />;

  return (
    <section className="mx-auto w-full max-w-xl py-12" aria-label="Photo preparation">
      <button className="mb-8 text-sm underline" onClick={() => { stopCamera(); onClose(); }} type="button">← Back</button>
      <p className="text-sm font-medium text-[#756f78]">Step 1 of 3 · Crop your photo</p>
      <h1 className="mt-2 text-3xl font-semibold">Prepare your photo</h1>
      <p className="mt-3 text-[#6d6870]">Choose a clear, evenly lit portrait. Your photo stays in this browser session.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-full bg-[#282536] px-5 py-3 text-white" onClick={() => inputRef.current?.click()} type="button">Upload photo</button>
        <button className="rounded-full border border-[#bbb3b1] px-5 py-3" onClick={() => void openCamera()} disabled={cameraBusy} type="button">{cameraBusy ? "Opening camera…" : "Take photo"}</button>
      </div>
      <input ref={inputRef} className="sr-only" aria-label="Upload portrait" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ""; }} />
      {cameraOpen && (
        <div className="mt-6 rounded-xl border border-[#ded8d2] p-3">
          <p className="mb-3 text-sm font-semibold">Camera preview</p>
          <video ref={videoRef} autoPlay playsInline muted className="mx-auto max-h-96 w-full rounded-lg bg-black object-contain" aria-label="Live camera preview" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="rounded-full bg-[#282536] px-5 py-3 text-white" onClick={takePhoto}>Capture photo</button>
            <button type="button" className="rounded-full border border-[#bbb3b1] px-5 py-3" onClick={stopCamera}>Cancel camera</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      {url && !preview && !cameraOpen && (
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
                role="group"
                aria-label="Crop selection. Drag to move; use arrow keys to reposition."
                tabIndex={0}
                onKeyDown={nudgeCrop}
                onPointerDown={(event) => beginCropDrag(event, "move")}
                onPointerMove={updateCropDrag}
                onPointerUp={() => { dragRef.current = null; }}
                onPointerCancel={() => { dragRef.current = null; }}
                className="absolute cursor-move touch-none border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] outline-offset-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#282536]"
                style={{
                  left: `${(rect.left / dimensions.width) * 100}%`,
                  top: `${(rect.top / dimensions.height) * 100}%`,
                  width: `${(rect.side / dimensions.width) * 100}%`,
                  height: `${(rect.side / dimensions.height) * 100}%`,
                }}
              >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }, (_, index) => <div key={index} className="border border-white/35" />)}
                </div>
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Crop size"
                  aria-valuemin={1}
                  aria-valuemax={3}
                  aria-valuenow={Number(crop.zoom.toFixed(2))}
                  aria-valuetext={`${crop.zoom.toFixed(1)} times zoom`}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowUp" && event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft") return;
                    event.preventDefault();
                    event.stopPropagation();
                    setCrop((current) => ({ ...current, zoom: Math.max(1, Math.min(3, current.zoom + (event.key === "ArrowUp" || event.key === "ArrowRight" ? 0.1 : -0.1))) }));
                  }}
                  onPointerDown={(event) => { event.stopPropagation(); beginCropDrag(event, "resize"); }}
                  onPointerMove={(event) => { event.stopPropagation(); updateCropDrag(event); }}
                  onPointerUp={(event) => { event.stopPropagation(); dragRef.current = null; }}
                  onPointerCancel={(event) => { event.stopPropagation(); dragRef.current = null; }}
                  className="absolute -bottom-2 -right-2 h-6 w-6 cursor-nwse-resize touch-none rounded-sm border-2 border-[#282536] bg-white focus-visible:outline focus-visible:outline-2"
                />
              </div>
            );
          })()}
          </div>
          <p className="mt-4 text-sm text-[#6d6870]">Drag the square to move the crop. Drag its bottom-right handle to resize. Keyboard: focus the square and use arrow keys to move, or focus the handle and use arrow keys to resize.</p>
          <button type="button" className="mt-3 text-sm underline" onClick={() => setCrop({ zoom: 1, x: 0.5, y: 0.5 })}>Reset crop</button>
          <button type="button" className="mt-5 rounded-full bg-[#282536] px-5 py-3 text-white" onClick={cropPhoto} disabled={!dimensions}>I’m happy with the crop — adjust lighting</button>
        </div>
      )}
      {preview && !calibrating && (
        <div className="mt-8">
          <img src={preview} alt="Cropped portrait preview" className="mx-auto w-64 rounded-lg" />
          <p className="mt-4 text-sm text-[#6d6870]">Your crop is ready. Continue to lighting or go back and adjust it.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="rounded-full bg-[#282536] px-5 py-3 text-white" onClick={() => setCalibrating(true)}>I’m happy with the crop — adjust lighting</button>
            <button type="button" className="rounded-full border border-[#bbb3b1] px-5 py-3" onClick={() => setPreview(null)}>Adjust crop</button>
          </div>
        </div>
      )}
    </section>
  );
}
