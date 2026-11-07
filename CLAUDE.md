# Anima

Narrative 3D browser game (Three.js + React + TypeScript), deployed on Vercel.

## Docs

- [docs/architecture.md](docs/architecture.md): pages, the Game singleton, the render loop and the scene lifecycle.
- [docs/scenes.md](docs/scenes.md): BaseScene API, zones (spawn, zoom, subtitles), scene children, how to add a scene.
- [docs/events.md](docs/events.md): the remaining React ↔ game events and what replaced the others.
- [docs/assets.md](docs/assets.md): asset formats, compression commands, the loader cache and mobile variants.

## Commands

- `yarn dev`: dev server (`$` and `[` debug keys are dev only)
- `npx tsc -b`: type-check
- `yarn lint`
- `yarn build`: type-check + production build (strips `console.log/info/debug`)
