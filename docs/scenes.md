# Scenes

Every game scene extends `src/game/scenes/BaseScene.ts`.

## BaseScene API

| Member | Use |
| --- | --- |
| `loadSceneModel(url)` | Loads a GLB through the [asset cache](assets.md). Returns `null` if the scene was disposed meanwhile. |
| `createFloor(mesh)` | Builds the walkable floor, the character and the camera. Applies any spawn or zoom requested before it existed. |
| `generateSpawns(zones)` | `{ to }` zones are exits, `{ from }` zones are entry points. |
| `generateZoomZones(zones)` | `{ size, zoom }`: camera zoom while inside. |
| `generateSubtitlesTriggerZones(zones)` | Plays subtitles once on entry. |
| `generateBackgroundMaps(urls)` | Painted parallax layers (sRGB textures). |
| `onUpdate(time, dt)` | Per-frame hook. |
| `onCharacterMove(position)` | Called when the character moves. |
| `children` | `SceneChild` objects (NPCs, interactive objects) updated and disposed with the scene. |
| `dispose()` | Releases models, textures, children, particles. Override to clean up extra state, then call `super.dispose()`. |

## Zones

- Spawning snaps the camera to the character (`Camera.snapToCharacter`), and so does creating the camera.
- Exits trigger on entry only (edge-triggered), with a radius of 0.75. A character spawned inside an exit doesn't teleport back.
- Interactions (NPCs, objects) only react while their scene is the current one (`gameState.currentScene`).

## Adding a scene

1. Create the class in `src/game/scenes/`.
2. Add it to `factories` in `sceneRegistry.ts`, and to `neighbors` of the pages that lead to it.
3. Add a `showScene({ currentSceneIndex, soundTrack, subs })` case in `Pages.tsx`.

## Materials

The renderer is `WebGPURenderer`, so custom materials are node materials built with TSL (`three/tsl`), not GLSL.

- NPC bodies (meshes named `shader*` in `npccharacter.glb`) use `NpcMaterial` (`npcMaterial.ts`), one instance per NPC: transparent `MeshBasicNodeMaterial`, purple `#8033ff`, opacity `(1 - dot(normalView, viewDirection))^1.4`, so the body is see-through and the rim glows. No depth write.
- Particles (`particles.ts`) are one instanced `Sprite` with `PointsNodeMaterial`; positions and colors are `InstancedBufferAttribute`s read with `instancedDynamicBufferAttribute`, and `sprite.count` is the number of live particles.
- Particle colors come from `SurfaceColor` (`surfaceColor.ts`), plus a random lightness offset. It raycasts down into the opaque visible models from `loadSceneModel`, because the `floor` mesh is invisible and has no texture, and uses the hit closest to foot height. It reads a 128 px copy of the hit texture and only raycasts again after moving 0.1 units. It uses the base color, so scene lighting is not included.
- Node-material colors are linear: `color(0x8033ff)` converts the hex from sRGB.

Shared helpers: `collectFloating` / `updateFloating` and the flame sprite sheets in `hub.ts` (reused by `hubEnd.ts`).
