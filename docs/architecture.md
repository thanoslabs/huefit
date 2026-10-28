# Architecture

HueFit is a static React/TypeScript application built with Vite. No backend, account, or database is required. All photographs, image corrections, face landmarks, and analysis state remain in volatile browser memory. Static model and texture assets may be cached, but personal photographs must not be persisted or transmitted.

## Planned modules

- `capture`: upload, camera, crop, image validation, and memory cleanup.
- `calibration`: image quality checks, non-destructive white balance, temperature, tint, and exposure correction.
- `analysis`: face landmarks, colour sampling, interpretable ranking, and manual corrections.
- `palettes`: versioned twelve-season palette definitions.
- `draping`: Canvas-based drapes and side-by-side swatches/textures.
- `export`: browser-local result export.

These modules are **planned**, not yet implemented. Keep colour computations in framework-independent TypeScript and run expensive work in workers as needed.

## Accuracy and privacy

Seasonal recommendations are subjective styling guidance, not objective diagnoses. A single photograph may not permit reliable lighting correction. Show uncertainty and request better lighting where appropriate. Do not upload photos, add tracking SDKs, or store images in localStorage, IndexedDB, or service-worker caches.
