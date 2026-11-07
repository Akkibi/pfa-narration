import { useEffect, useState } from "react";
import type * as Runtime from "./runtime";

export type GameRuntime = typeof Runtime;

const CHUNK_SHARE = 0.2;
const RENDERER_SHARE = 0.1;
const ASSETS_SHARE = 1 - CHUNK_SHARE - RENDERER_SHARE;
const FIRST_SCENE = "hub_pano";

let runtimePromise: Promise<GameRuntime> | null = null;
const loadRuntime = () => (runtimePromise ??= import("./runtime"));

// Fetches the game chunk after the home page, then reports progress until the first scene can run.
export function useGameLoader() {
    const [runtime, setRuntime] = useState<GameRuntime | null>(null);
    const [progress, setProgress] = useState(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;
        loadRuntime()
            .then(async (module) => {
                if (active) setProgress(CHUNK_SHARE);
                await module.Game.get().ready;
                if (active) setRuntime(module);
            })
            .catch((error) => console.error("Game failed to load", error));
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!runtime || ready) return;
        let frame = 0;
        let shown = CHUNK_SHARE + RENDERER_SHARE;
        const tick = () => {
            const assets = runtime.loadProgress();
            const sceneReady = runtime.getScene(FIRST_SCENE)?.isReady ?? true;
            if (assets.pending === 0 && (sceneReady || assets.failed > 0)) {
                runtime.stopLoadTracking();
                setProgress(1);
                setReady(true);
                return;
            }
            const next = CHUNK_SHARE + RENDERER_SHARE + ASSETS_SHARE * assets.progress * 0.99;
            if (next > shown + 0.005) {
                shown = next;
                setProgress(next);
            }
            frame = requestAnimationFrame(tick);
        };
        setProgress(shown);
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [runtime, ready]);

    return { runtime, progress, ready };
}
