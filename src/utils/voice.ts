import { Howl } from "howler";
import { AudioData } from "../data/audioData";

// Dialogue voices: one line at a time, preloaded per conversation, start reported to the UI.
const voices = new Map<string, Howl>();
let current: { howl: Howl; id: number } | null = null;
let token = 0;

const getVoice = (name: string) => {
    let howl = voices.get(name);
    if (!howl) {
        const sound = AudioData.find((a) => a.name === name);
        if (!sound) return null;
        howl = new Howl({ src: [sound.src], volume: sound.volume ?? 1 });
        voices.set(name, howl);
    }
    return howl;
};

export const preloadVoices = (names: string[]) => names.forEach(getVoice);

export const stopVoice = () => {
    token++;
    if (current) current.howl.stop(current.id);
    current = null;
};

// onStart receives the clip duration in seconds, or 0 when the clip cannot play.
export const playVoice = (name: string, onStart: (duration: number) => void) => {
    stopVoice();
    const playToken = token;
    const start = (duration: number) => {
        if (playToken === token) onStart(duration);
    };
    const howl = getVoice(name);
    if (!howl) return start(0);
    const id = howl.play();
    current = { howl, id };
    howl.once("play", () => start(howl.duration(id)), id);
    howl.once("playerror", () => start(0), id);
    howl.once("loaderror", () => start(0));
};

export const releaseVoices = () => {
    stopVoice();
    voices.forEach((howl) => howl.unload());
    voices.clear();
};
