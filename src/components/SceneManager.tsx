import { useEffect, useRef } from "react";
import { Test } from "../game/scenes/test";
import { Hub2 } from "../game/scenes/hub2";
import { Scenes } from "./contexts/TransitionManager";
import { Game } from "../game/game";
import { Souvenir } from "../game/scenes/souvenir";
import { Hub } from "../game/scenes/hub";

export type GameScenes = Hub | Test | Souvenir | Hub2;
export type SceneManagerProps = {
    currentSceneIndex: Scenes;
    scene: GameScenes;
    subs: Subtitle[];
};

export default function SceneManager({ currentSceneIndex, scene, subs }: SceneManagerProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const game = Game.getInstance(currentSceneIndex, scene);

    useEffect(() => {
        if (!mountRef.current) return;
        game.start(mountRef.current);
        console.log("subtitles", subs);
        // eventEmitterInstance.trigger("triggerSubs", [subs]);
        return () => {
            game.cleanup();
        };
    }, [game]);

    useEffect(() => {
        if (!mountRef.current) return;
        console.log("GAME SET SCENE", currentSceneIndex);
        game.setScene(scene, currentSceneIndex);

        // return () => {
        //     game.cleanup();
        // };
    }, [scene, currentSceneIndex, game]);

    return (
        <>
            <div className="scene" ref={mountRef}></div>
            <div
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
            </div>
        </>
    );
}
