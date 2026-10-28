# MVP release checklist

HueFit is a browser-local, exploratory personal colour styling tool. It does not provide validated skin undertone or seasonal diagnoses.

## Automated checks

- [ ] CI formatting, lint, TypeScript, unit tests and production build pass.
- [ ] GitHub Pages deployment completes and `/huefit/` loads.
- [ ] No photograph is sent to a backend or stored persistently.
- [ ] Palette CSV and SVG downloads work without containing portrait pixels.

## Browser smoke test

Test desktop and mobile viewport sizes:

1. Upload a JPEG, PNG or WebP portrait; verify invalid formats and large images are rejected.
2. Crop and reposition, navigate backward and replace the photo.
3. Adjust exposure, temperature and tint; compare original and corrected images.
4. Detect face landmarks (or use manual fallback) and adjust sampling points.
5. Review seasonal results and manually choose another season.
6. Compare seasonal swatches and virtual drapes; change opacity, coverage and fabric finish.
7. Export CSV and SVG; verify the correct season and palette appear.
8. Verify keyboard-only navigation, visible focus and understandable labels.
9. Refresh the Pages URL and verify navigation remains under the `/huefit/` base path.
10. Confirm that closing the flow releases object URLs and camera access does not remain active.

## Release process

1. Merge and deploy all MVP changes.
2. Review outstanding dependency/security alerts, especially browser-side model loading.
3. Run the smoke test and record any remaining limitations.
4. Tag the first release using a bare SemVer tag, such as `0.1.0`, only after acceptance.
5. Publish release notes describing features, known limitations, and the privacy model.

Do not tag or publish automatically as part of this checklist.
