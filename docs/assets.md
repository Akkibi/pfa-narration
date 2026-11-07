# Assets

Everything served lives in `public/`. Source files that aren't served (the original flame frame zips) live in `assets-src/`.

## Formats

| Kind | Format | Notes |
| --- | --- | --- |
| Models | `.glb`, Draco geometry + WebP textures | Decoder in `public/draco/` (copied from `three/examples/jsm/libs/draco/gltf`). |
| Textures, UI images | `.webp`, lossy quality 90 | Animated images (`audio_wave.webp`) are animated WebP. |
| Sprite sheets | One `.webp` per animation | Flames: 5×3 grid, 15 frames. Interaction icon: 8×8 grid, 60 frames. Animated by moving UVs (`utils/animationManager.ts`). |
| Music | `.opus`, 128 kb/s | No MP3 fallback. |
| Voices, effects | `.opus`, 64 kb/s | |
| Videos | `.webm` (VP9/AV1), `home.mp4` (H.264) | `home-poster.webp` shows while the home video loads. |

## Commands

Compress a GLB (textures keep their original size):

```sh
npx @gltf-transform/cli@4.2.1 optimize in.glb out.glb --compress draco --texture-compress webp --texture-size 16384
```

When a model has textures larger than 4096 px, also export a `*.mobile.glb` with `--texture-size 4096`. Scenes load it when `preferLowRes()` is true: max texture size below 8192, or a touch screen. Currently only `souvenir/scene2.mobile.glb` exists.

Audio:

```sh
ffmpeg -i in.wav -c:a libopus -b:a 64k out.opus   # 128k for music
```

Sprite sheet from numbered frames:

```sh
ffmpeg -i %d.png -vf tile=5x3 -c:v libwebp -quality 90 sheet.webp
```

## Loader cache

`src/game/assets.ts` caches models and textures by URL and tracks which scene (owner) uses them:

- `loadModel(url, owner)` returns a clone. Geometries and materials are shared between clones and flagged `userData.shared`.
- `loadTexture(url, owner, colorSpace)`: use `SRGBColorSpace` for color maps, `NoColorSpace` for alpha maps.
- `release(owner)` disposes the GPU resources no other scene still uses. `BaseScene.dispose()` calls it.
- `loadProgress()` returns `{ progress, pending, failed }` over the loads started since page start, weighted by bytes (a load counts as 256 KB until its size is known). Only the startup loader reads it, then calls `stopLoadTracking()`.

## Texture quality

`trackTexture` registers every texture the cache loads, plus the clones made by `utils/animationManager.ts`. Any other clone must call `trackTexture` and `untrackTexture` too, or it keeps its old size.

- High uploads the original, Mid half its width and height, Low a quarter. Images of 256 px or less are never scaled.
- Scaling happens in the browser, so it saves GPU memory but not download size. The original stays in memory so quality can change without a reload.
- A change replaces `source.data` and disposes each GPU texture, because a new size needs a new one.
- Read sizes with `textureSize(texture)`, never `texture.image`, when they drive geometry.
- `preferLowRes()` is also true at Mid and Low. It is read when a scene loads.

## Caching on Vercel

`vercel.json`: hashed `/assets/*` are immutable for a year; files in `public/` are cached for a week, then revalidated in the background. Renaming a file busts its cache.
