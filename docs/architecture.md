# Architecture

## Pages

`src/pages/Pages.tsx` renders one page at a time from `displayedPage` (see `TransitionManager`, which fades between pages). A page is either a video (`Player`), the home screen, or a game scene (`SceneManager`).

Page order lives in `ScenesSequence`: home → intro_prison → hub_pano → hub → dream → hub_end → falling → dark_world → stairs → end → credits.

## Startup loading

The main chunk holds only React, the home page, videos, audio and UI; it never imports three.js. Everything that does (`src/game/*`, `SceneManager`, `data/objectsData`, `data/characters_data`, `utils/utils`, `utils/lerp`, `utils/animationManager`) is reached through `src/game/runtime.ts`, loaded with a dynamic `import()`. UI components that need a type from those modules use `import type`.

`useGameLoader()` (`src/game/loader.ts`, used by `Pages`) fetches that chunk when the app mounts, waits for `Game.get().ready`, and only then hands the runtime to `Pages`, which calls `prepareScenes`. From home that preloads `hub_pano`. Progress shown under the home "enter" button:

| Share | Step |
| --- | --- |
| 0–20 % | game chunk downloaded |
| 20–30 % | renderer initialized |
| 30–100 % | asset bytes (`loadProgress()` in `assets.ts`) |

"enter" is enabled once `hub_pano.isReady` and no load is pending (or once loads finish with a failure, so a missing file never locks the button). The loader then calls `stopLoadTracking()`; later loads are not tracked.

## Game singleton

`src/game/game.ts` holds one `WebGPURenderer` (from `three/webgpu`) for the whole session (`Game.get()`), so changing pages never recreates the GPU context or re-uploads textures. It uses WebGPU when available and falls back to WebGL 2 on its own.

- `renderer.init()` is async: `Game.ready` resolves after it and sets the max texture size used by `preferLowRes()`. The loop skips frames until `renderer.initialized`.
- Custom materials are node materials written in TSL (`three/tsl`); `ShaderMaterial` with GLSL does not run on this renderer.

- `start(mount)` attaches the canvas and starts the loop; `cleanup()` detaches it and stops the loop, but keeps the renderer.
- `setScene(scene, id)` switches the rendered scene.
- Pixel ratio is `min(devicePixelRatio, 1.5)`. If most frames over ~2 s take more than 28 ms, it drops to 1. Choosing a resolution in the [settings](#settings) replaces this with `devicePixelRatio × multiplier`, with no automatic drop.

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

## Settings

`src/components/SettingsMenu.tsx` is a popover opened from the top left of every page. `src/utils/settings.ts` holds the values, stores them in `localStorage` and fires `settingsChanged`.

- Resolution: multiplier of `devicePixelRatio`, 0.25 to 1. Until moved, the slider shows the value matching the automatic ratio.
- Textures: High, Mid or Low. See [assets.md](assets.md#texture-quality).
- [Back to menu](#back-to-menu), on every page but home.

Both apply immediately. Space and the arrows also move the character, so controls release focus after a mouse or touch press.

## Skip

`src/components/SkipButton.tsx` shows at the top right wherever the player can only wait:

- Every `Player` video. It stops the page's sounds and subtitles, then runs the same path as the video ending, so `falling` still shows its choice.
- The white screen with a centered subtitle in `TransitionManager`, which jumps to the fade from white.
- Each [dialogue](dialogue.md) line while its voice plays.

Game scenes have no skip, because the player can move during their subtitles.

`Player` starts its sounds and subtitles once per mount. `Pages` passes new arrays on every render, including during the fade out, so these props must not be effect dependencies. Each `Player` page that follows another needs its own `key`.

## Back to menu

`goToMenu` in `TransitionManager` cancels any running transition, stops sounds and subtitles, closes dialogue and object panels, resets dialogue progress and goes home. `prepareScenes("home")` then disposes every scene except `hub_pano`, which holds no progress, so the next run starts clean.

The settings panel offers it on every page but home. The credits wait on their last frame with the same button instead of leaving on their own (`endsWithMenuButton` in `Player`).
