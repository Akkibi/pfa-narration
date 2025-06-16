import { useEffect, useRef } from "react";
import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { Scene1 } from "../game/scenes/Scene1";
import { Scene2 } from "../game/scenes/Scene2";
import { Scene3 } from "../game/scenes/Scene3";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { gameState } from "../game/gameState";
import { Scenes } from "./contexts/TransitionManager";

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

type SceneManagerProps = {
    currentSceneIndex: Scenes;
    scene: Scene1 | Scene2 | Scene3;
};

export default function SceneManager({ currentSceneIndex, scene }: SceneManagerProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number>(null);

    gameState.currentScene = currentSceneIndex;
    useEffect(() => {
        if (!mountRef.current) return;
        if (mountRef.current.children.length > 0) return;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            // Important: ensure the renderer preserves the drawing buffer
            preserveDrawingBuffer: true,
        });
        renderer.setPixelRatio(1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Time tracking
        let lastTime = Date.now();
        let time = Date.now();
        const fps = 70;
        // How many milliseconds should pass before the next frame
        const interval = 1000 / fps;

        // Animation loop
        const animate = (tick: number) => {
            time = Date.now();

            const deltaTime = time - lastTime;

            if (lastTime === undefined) {
                lastTime = time;
            }

            if (deltaTime >= interval) {
                stats.begin();
                eventEmitterInstance.trigger(`updateScene-${gameState.currentScene}`);
                const camera = scene.camera;
                if (camera !== null) {
                    renderer.render(scene.instance, camera.camera);
                }
                lastTime = time;
                stats.end();
            }

            animRef.current = requestAnimationFrame(() => animate(tick + 1));
        };

        // Start animation loop
        animate(0);

        // Handle window resize
        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.pixelRatio = window.devicePixelRatio;
            scene.camera?.handleResize();
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            console.log("EXIT", currentSceneIndex);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            if (animRef.current) cancelAnimationFrame(animRef.current);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

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
