import type BaseScene from "./scenes/BaseScene";
import { Scenes } from "../components/contexts/TransitionManager";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { Game } from "./game";
import { HubPano } from "./scenes/hubPano";
import { Hub } from "./scenes/hub";
import { Dream } from "./scenes/dream";
import { HubEnd } from "./scenes/hubEnd";
import { DarkWorld } from "./scenes/darkWorld";
import { Test } from "./scenes/test";

const factories: Partial<Record<Scenes, () => BaseScene>> = {
    hub_pano: () => new HubPano(),
    hub: () => new Hub(),
    dream: () => new Dream(),
    hub_end: () => new HubEnd(),
    dark_world: () => new DarkWorld(),
    test: import.meta.env.DEV ? () => new Test() : undefined,
};

// Scenes kept alive (and preloaded) while a page is displayed, besides the page itself.
const neighbors: Partial<Record<Scenes, Scenes[]>> = {
    intro_prison: ["hub_pano"],
    hub_pano: ["hub"],
    hub: ["hub_pano", "dream"],
    dream: ["hub_end"],
    hub_end: ["dark_world"],
    falling: ["hub_end", "dark_world"],
    test: ["hub_pano", "hub", "dream", "hub_end", "dark_world"],
};

const live = new Map<Scenes, BaseScene>();

export const getScene = (id: Scenes): BaseScene | null => {
    const existing = live.get(id);
    if (existing) return existing;
    const factory = factories[id];
    if (!factory) return null;
    Game.get();
    const scene = factory();
    live.set(id, scene);
    return scene;
};

export const prepareScenes = (page: Scenes) => {
    const keep = new Set<Scenes>([page, ...(neighbors[page] ?? [])]);
    for (const id of keep) getScene(id);
    for (const [id, scene] of live) {
        if (keep.has(id)) continue;
        scene.dispose();
        live.delete(id);
    }
};

eventEmitterInstance.on("scene-change-game", (to: Scenes, from: Scenes) => {
    getScene(to)?.spawnFrom(from);
});
