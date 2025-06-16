import { useEffect, useRef } from "react";
import { Scene1 } from "../game/scenes/Scene1";
import { Scene2 } from "../game/scenes/Scene2";
import { Scene3 } from "../game/scenes/Scene3";
import { Scenes } from "./contexts/TransitionManager";
import { Game } from "../game/game";

export type GameScenes = Scene1 | Scene2 | Scene3;
export type SceneManagerProps = {
    currentSceneIndex: Scenes;
    scene: GameScenes;
};

export default function SceneManager({ currentSceneIndex, scene }: SceneManagerProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const game = Game.getInstance(currentSceneIndex, scene);

    useEffect(() => {
        if (!mountRef.current) return;
        game.start(mountRef.current);
        return () => {
            game.cleanup();
        };
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
        console.log("GAME SET SCENE", currentSceneIndex);
        game.setScene(scene, currentSceneIndex);

        // return () => {
        //     game.cleanup();
        // };
    }, [scene, currentSceneIndex, game]);

    return (
        <div className="scene-container">
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
        </div>
    );
}
