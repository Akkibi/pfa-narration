# Anima

A narrative 3D game that runs in the browser, made at Gobelins (March–June 2025). Charlie, a painter in prison, digs through his memories to understand why he stopped painting.

**Play:** https://pfa-anima.vercel.app/

Built with Three.js, React, TypeScript, GSAP and Howler.

## Credits

- Game design, scenario, level design, painted backgrounds, textures, sound and modelling: Nathan Nicoleau, Anaïs Chenichene, Minh Duc, Alix Vigneron.
- Development: Akira Valade, Fabrizio Manetti.

## Controls

- `WASD` / arrows: move
- `Shift`: run
- `Space`: jump
- `E`: interact / talk
- Mouse wheel: rotate an inspected object

## Development

```sh
yarn          # install
yarn dev      # dev server
yarn build    # type-check + production build
yarn lint
```

In dev only, `$` jumps to the test scene and `[` skips to the next page.

See [docs/](docs/architecture.md) for how the game is structured and how assets are prepared.
