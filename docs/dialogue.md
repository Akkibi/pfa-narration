# Dialogue and audio

## Dialogue box

`src/components/game/dialog.tsx` shows one line at a time from a `DialogDataType` (`data/dialogData.ts`). Line keys (`start`, `A`, `B`…) are reused by every NPC, so a line is only shown through `showLine(key)`, never derived from stale state.

Timing of a line:

1. The box opens (`BOX_OPEN_MS`, 500 ms).
2. The line's voice starts (`playVoice`). The text starts when Howler fires `play`, so a slow network delays text and voice together.
3. Letters appear at `clip duration / text length`, falling back to `dialog.duration`, then to `READ_LETTER_MS` (40 ms) when there is no audio.
4. The options fade in when the last letter appears. Input (clicks, arrows, Enter) is accepted only once they start appearing; held Enter (`repeat`) is ignored.

Choosing an option stops the current voice before the next line. Closing the dialog stops and unloads the conversation's voices.

## Voices

`src/utils/voice.ts` plays dialogue clips, one at a time:

- `preloadVoices(names)`: creates the conversation's `Howl`s when the dialog opens.
- `playVoice(name, onStart)`: stops any current line, then calls `onStart(duration)` when the clip actually plays, or `onStart(0)` if it can't. Callbacks of an interrupted line are dropped.
- `stopVoice()`, `releaseVoices()`.

Music, ambiences and effects go through `AudioControls` (`playSound`, `stopHowlers` events). The mute button calls `Howler.mute()`, which mutes every sound, voices included.
