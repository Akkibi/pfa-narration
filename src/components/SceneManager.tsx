import { useEffect, useRef } from "react";
import { Test } from "../game/scenes/test";
import { Hub } from "../game/scenes/hub";
import { Scenes } from "./contexts/TransitionManager";
import { Game } from "../game/game";
import { Dream } from "../game/scenes/dream";
import { HubPano } from "../game/scenes/hubPano";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { Subtitle } from "../data/subsData";
import { HubEnd } from "../game/scenes/hubEnd";
import { DarkWorld } from "../game/scenes/darkWorld";

export type GameScenes = HubPano | Test | Dream | Hub | HubEnd | DarkWorld;
export type SceneManagerProps = {
    currentSceneIndex: Scenes;
    scene: GameScenes;
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
    const game = Game.getInstance(currentSceneIndex, scene);

    useEffect(() => {
        console.log("SCENE MANAGER MOUNTED", currentSceneIndex, scene);
        if (!mountRef.current) return;
        game.start(mountRef.current);
        eventEmitterInstance.trigger("triggerSubs", [subs]);
        return () => {
            game.cleanup();
        };
    }, [game]);

    useEffect(() => {
        if (!mountRef.current) return;
        console.log("GAME SET SCENE", currentSceneIndex);
        // eventEmitterInstance.trigger("stopHowlers", [["hub", "souvenir", "monde_noir", "outro"]]);
        eventEmitterInstance.trigger("playSound", [soundTrack]);
        game.setScene(scene, currentSceneIndex);

        // return () => {
        //     game.cleanup();
        // };
    }, [scene, currentSceneIndex, game]);

    return (
        <>
            <div className="scene" ref={mountRef}></div>
            {/* <div
                className="scene-info"
                style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: "10px",
                    borderRadius: "4px",
                }}
            >
                Current Scene: {currentSceneIndex}
            </div> */}
        </>
    );
}
