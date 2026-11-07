import { eventEmitterInstance } from "./eventEmitter";

export type TextureQuality = "high" | "mid" | "low";

export type Settings = {
    // Multiplies devicePixelRatio. null keeps the automatic ratio, capped and lowered on slow devices.
    resolution: number | null;
    textureQuality: TextureQuality;
};

const STORAGE_KEY = "anima-settings";
const DEFAULTS: Settings = { resolution: null, textureQuality: "high" };

const readStored = (): Settings => {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
    } catch {
        return DEFAULTS;
    }
};

let settings = readStored();

export const getSettings = () => settings;

export const updateSettings = (change: Partial<Settings>) => {
    settings = { ...settings, ...change };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Private browsing can refuse storage: the setting still applies to this session.
    }
    eventEmitterInstance.trigger("settingsChanged");
};
