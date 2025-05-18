import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { eventEmitterInstance } from "../../utils/eventEmitter";
import { TransitionManager } from "../../utils/transitionManager";
import { Scene1 } from "../../game/scenes/Scene1";
import { Scene2 } from "../../game/scenes/Scene2";
import { Scene3 } from "../../game/scenes/Scene3";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { gameState } from "../../game/gameState";
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

interface SceneListType {
    [key: string]: Scene1 | Scene2 | Scene3;
}

const ThreeScene = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(1);
    console.log("currentSceneIndex", currentSceneIndex);
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
        // Create scenes
        const scenes: SceneListType = {
            1: new Scene1(),
            2: new Scene2(),
            3: new Scene3(),
        };

        // Create transition manager
        const transitionManager = new TransitionManager();

        // Load transition texture
        transitionManager
            .loadTransitionTexture("./gradient.png")
            .then(() => console.log("Transition texture loaded"))
            .catch((err) => console.error("Failed to load transition texture:", err));

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
                const camera = scenes[`${gameState.currentScene ?? 1}`].camera;
                if (camera !== null) {
                    renderer.render(
                        scenes[`${gameState.currentScene ?? 1}`].instance,
                        camera.camera,
                    );
                }
                lastTime = time;
                stats.end();
            }

            requestAnimationFrame(() => animate(tick + 1));
        };

        // Start animation loop
        animate(0);

        const sceneChangeHandler = (sceneId: number) => {
            setCurrentSceneIndex(sceneId);
            console.log("changeSceneIndex", currentSceneIndex, sceneId);
        };

        // Listen for scene change events
        eventEmitterInstance.on("scene-change", sceneChangeHandler);

        // Handle window resize
        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.pixelRatio = window.devicePixelRatio;
            for (const [key, value] of Object.entries(scenes)) {
                console.log(key);
                value.camera?.handleResize();
            }
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            // window.location.reload();
            // eventEmitterInstance.off("nextScene");
            transitionManager.dispose();
            renderer.dispose();
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
};

export default ThreeScene;
