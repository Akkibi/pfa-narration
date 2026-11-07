import { useState, type MouseEvent } from "react";
import { getSettings, updateSettings, type TextureQuality } from "../utils/settings";
import { MAX_AUTO_PIXEL_RATIO } from "../utils/pixelRatio";
import "./settings.css";

const QUALITIES: { value: TextureQuality; label: string }[] = [
    { value: "high", label: "High" },
    { value: "mid", label: "Mid" },
    { value: "low", label: "Low" },
];

const autoResolution = () => Math.min(1, MAX_AUTO_PIXEL_RATIO / (window.devicePixelRatio || 1));

// Space and the arrows also move the character, so a mouse or touch press must not keep focus here.
const releaseFocus = (event: MouseEvent<HTMLElement>) => {
    if (event.detail > 0) event.currentTarget.blur();
};

export default function SettingsMenu() {
    const [settings, setSettings] = useState(getSettings);
    const resolution = settings.resolution ?? autoResolution();

    const change = (next: Parameters<typeof updateSettings>[0]) => {
        updateSettings(next);
        setSettings(getSettings());
    };

    return (
        <>
            <button
                type="button"
                className="settings-button"
                popoverTarget="settings-panel"
                aria-label="Settings"
                onClick={releaseFocus}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h9M18 7h2M4 17h2M11 17h9" />
                    <circle cx="15.5" cy="7" r="2.5" />
                    <circle cx="8.5" cy="17" r="2.5" />
                </svg>
            </button>
            <div id="settings-panel" className="settings-panel" popover="auto">
                <label className="settings-row">
                    <span>
                        Resolution <output>×{resolution.toFixed(2)}</output>
                    </span>
                    <input
                        type="range"
                        min={0.25}
                        max={1}
                        step={0.05}
                        value={resolution}
                        onChange={(event) => change({ resolution: Number(event.target.value) })}
                        onClick={releaseFocus}
                    />
                </label>
                <div className="settings-row" role="group" aria-label="Textures">
                    <span>Textures</span>
                    <div className="settings-options">
                        {QUALITIES.map(({ value, label }) => (
                            <button
                                type="button"
                                key={value}
                                aria-pressed={settings.textureQuality === value}
                                onClick={(event) => {
                                    change({ textureQuality: value });
                                    releaseFocus(event);
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
