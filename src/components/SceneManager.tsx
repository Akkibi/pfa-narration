import { useEffect, useRef } from "react";
import { Scenes } from "./contexts/TransitionManager";
import { Game } from "../game/game";
import type BaseScene from "../game/scenes/BaseScene";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { Subtitle } from "../data/subsData";

export type SceneManagerProps = {
    currentSceneIndex: Scenes;
    scene: BaseScene;
    soundTrack: "hub" | "souvenir" | "monde_noir" | "outro" | "hub_end";
    subs?: Subtitle[];
};

export default function SceneManager({
    currentSceneIndex,
    scene,
    soundTrack,
    subs = [],
}: SceneManagerProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const subsRef = useRef(subs);

    useEffect(() => {
        if (!mountRef.current) return;
        const game = Game.get();
        game.start(mountRef.current);
        eventEmitterInstance.trigger("triggerSubs", [subsRef.current]);
        return () => {
            game.cleanup();
        };
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
        eventEmitterInstance.trigger("playSound", [soundTrack]);
        Game.get().setScene(scene, currentSceneIndex);
    }, [scene, currentSceneIndex, soundTrack]);

    return <div className="scene" ref={mountRef}></div>;
}
