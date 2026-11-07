# Architecture

## Pages

`src/pages/Pages.tsx` renders one page at a time from `displayedPage` (see `TransitionManager`, which fades between pages). A page is either a video (`Player`), the home screen, or a game scene (`SceneManager`).

Page order lives in `ScenesSequence`: home → intro_prison → hub_pano → hub → dream → hub_end → falling → dark_world → stairs → end → credits.

## Game singleton

`src/game/game.ts` holds one `THREE.WebGLRenderer` for the whole session (`Game.get()`), so changing pages never recreates the WebGL context or re-uploads textures.

- `start(mount)` attaches the canvas and starts the loop; `cleanup()` detaches it and stops the loop, but keeps the renderer.
- `setScene(scene, id)` switches the rendered scene.
- Pixel ratio is `min(devicePixelRatio, 1.5)`. If most frames over ~2 s take more than 28 ms, it drops to 1.

## Render loop

`animate` runs on `requestAnimationFrame`, capped at about 70 fps. Each frame calls `scene.update(time, dt)`:

- `time` is in seconds.
- `dt` is in 60 fps frames (1 = 16.7 ms), clamped to 3, so movement speed doesn't depend on the refresh rate.
- Use `damp(alpha, dt)` from `utils/lerp.ts` instead of a fixed lerp factor.

## Scene lifecycle

`src/game/sceneRegistry.ts` creates scenes lazily and disposes them:

- `getScene(id)` builds a scene on first use.
- `prepareScenes(page)` keeps the current page and its `neighbors` (the next scenes to preload) alive and disposes the rest.
- `scene-change-game` places the character at the spawn matching the previous scene.

Scenes load their GLBs asynchronously; see [scenes.md](scenes.md) and [assets.md](assets.md).
