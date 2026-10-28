# HueFit

[![CI](https://github.com/thanoslabs/huefit/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/thanoslabs/huefit/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/thanoslabs/huefit?sort=semver&display_name=tag)](https://github.com/thanoslabs/huefit/releases/latest)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue?logo=github)](https://thanoslabs.github.io/huefit/)
[![License: MIT](https://img.shields.io/github/license/thanoslabs/huefit)](LICENSE)

**HueFit** is a privacy-first, browser-only personal colour analysis app. Discover seasonal palettes, calibrate lighting, and compare clothing colours and fabrics without sending your photo to a server.

> Status: initial application shell. Photo analysis, calibration, draping and export are planned, not implemented yet.

## Local development

Use the Node version pinned in `.tool-versions`.

```sh
npm install
npm run dev
```

Validation: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.

## Design

- No accounts, photo uploads to a server, or persistent personal image storage.
- Automatic colour analysis with manual adjustments and 12-season classification.
- Reversible lighting calibration before analysis.
- Virtual draping and side-by-side swatch/material comparisons.

See [requirements](docs/requirements.md), [architecture](docs/architecture.md), and [backlog](docs/backlog.md).

Documentation is published using [nebula-md](https://github.com/thanoslabs/nebula-md). Releases follow bare `X.Y.Z` SemVer tags.
