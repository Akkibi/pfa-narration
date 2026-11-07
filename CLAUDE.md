# Anima

Narrative 3D browser game (Three.js WebGPU/TSL + React + TypeScript), deployed on Vercel.

## Docs

- [docs/architecture.md](docs/architecture.md): pages, startup loading (code split, progress bar), the Game singleton, the render loop, the scene lifecycle, settings and skip.
- [docs/scenes.md](docs/scenes.md): BaseScene API, zones (spawn, zoom, subtitles), TSL materials, how to add a scene.
- [docs/events.md](docs/events.md): the remaining React ↔ game events and what replaced the others.
- [docs/assets.md](docs/assets.md): asset formats, compression commands, the loader cache and mobile variants.
- [docs/dialogue.md](docs/dialogue.md): dialogue line timing, voice playback, muting.

## Commands

- `yarn dev`: dev server (`$` and `[` debug keys are dev only)
- `npx tsc -b`: type-check
- `yarn lint`
- `yarn build`: type-check + production build (strips `console.log/info/debug`)

## Dependencies

`resolutions` in `package.json` forces a patched `minimatch` under `@typescript-eslint/typescript-estree`; remove it once typescript-eslint ships a fixed range. `yarn audit` reports 0 vulnerabilities.
