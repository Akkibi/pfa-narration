# Events

`src/utils/eventEmitter.ts` connects React and the game. Always pair `on(name, cb)` with `off(name, cb)` in a cleanup; `off` removes only that callback.

Within the game, call methods directly (character → camera, scene → character) instead of using events.

| Event | From → To |
| --- | --- |
| `scene-change-ui` | game → `Pages` (change page, optionally with a subtitle) |
| `scene-change-game` | `Pages` → `sceneRegistry` (spawn the character from the previous scene) |
| `playSound`, `stopHowlers` | anywhere → `AudioControls` |
| `triggerSubs` | anywhere → `SubtitlesControls` |
| `openDialog`, `closeDialog` | NPC ↔ dialog UI |
| `showInteractiveObjectControls`, `toggleInteractiveObjectPanel` | interactive object → UI |
| `userInterractButtonPressed` | `Controls` (E key) → NPCs, objects |
| `toggleFreeze` | UI → `gameState.freezed` (stops character input) |
| `settingsChanged` | `utils/settings.ts` → `Game`, `assets.ts` |
| `returnToMenu` | `TransitionManager.goToMenu` → `AudioControls` (stops all sounds), `sceneRegistry` (resets dialogue progress) |
