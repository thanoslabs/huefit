import type { Point } from "./sampling";

export type Landmark = { x: number; y: number };
export type FaceResult = { points: Point[]; faceCount: number };

// Face Mesh indices for central cheek and forehead regions. These are starting
// positions only; users must review them before any colour interpretation.
const SAMPLE_INDICES = [205, 425, 10] as const;

export function samplingPointsFromFaces(faces: Landmark[][]): FaceResult | null {
  if (faces.length !== 1) return null;
  const face = faces[0];
  const points = SAMPLE_INDICES.map((index) => face[index]);
  if (points.some((point) => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1)) return null;
  return { points: points.map((point) => ({ x: point.x, y: point.y })), faceCount: 1 };
}

export async function detectFaceSamplingPoints(image: ImageData): Promise<FaceResult | null> {
  // Model and WASM are fetched as static assets; image pixels never leave the browser.
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const wasm = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm",
  );
  const detector = await FaceLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "CPU",
    },
    runningMode: "IMAGE",
    numFaces: 2,
  });
  try {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");
    ctx.putImageData(image, 0, 0);
    const result = detector.detect(canvas);
    return samplingPointsFromFaces(result.faceLandmarks);
  } finally {
    detector.close();
  }
}
