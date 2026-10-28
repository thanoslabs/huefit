# Product requirements

## Decisions

- Automatic analysis with manual adjustment.
- Twelve-season classification (three subtypes each of Spring, Summer, Autumn, and Winter).
- Virtual fabric draping around the face **and** side-by-side colour comparisons.
- Entirely browser-local photo processing, with no accounts or backend.
- Lighting calibration before analysis: quality warnings, automatic correction estimate, manual exposure/temperature/tint controls, and original/corrected comparison.

## MVP acceptance criteria

1. Upload JPEG/PNG/WebP or capture from a camera, crop and reposition, and discard the photo on session end.
2. Detect poor lighting and provide reversible calibration controls; do not infer skin colour from assumed neutral skin.
3. Rank seasonal recommendations with explanatory attributes and uncertainty, with manual override.
4. Compare swatches and representative fabric textures using both modes.
5. Export palettes locally without transferring personal images.
6. Work accessibly on mobile and desktop, with camera permission and error handling.

Material texture suggestions should not be presented as scientific inferences from facial appearance.
