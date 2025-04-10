import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { TransitionManager } from "../utils/transitionManager";
import { Scene1 } from "../game/scenes/Scene1";
import { Scene2 } from "../game/scenes/Scene2";
import { Scene3 } from "../game/scenes/Scene3";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { gameState } from "../game/gameState";
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const ThreeScene = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
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
        const scene1 = new Scene1();
        const scene2 = new Scene2();
        const scene3 = new Scene3();
        const scenes = [scene1, scene2, scene3];

        // Store camera in scene userData for accessibility
        scenes.forEach((scene) => {
            scene.instance.userData.camera = scene.camera;
        });

        // Create transition manager
        const transitionManager = new TransitionManager();

        // Load transition texture
        transitionManager
            .loadTransitionTexture("./gradient.png")
            .then(() => console.log("Transition texture loaded"))
            .catch((err) =>
                console.error("Failed to load transition texture:", err)
            );

        // Time tracking
        let lastTime = Date.now();
        let time = Date.now()
        let activeSceneIndex = 0;
        const fps = 60;
        // How many milliseconds should pass before the next frame
        const interval = 1000 / fps;


        // Animation loop
        const animate = (tick: number) => {
            time = Date.now()

            const deltaTime = (time - lastTime);

            if (lastTime === undefined) {
                lastTime = time;
            }

            if (deltaTime >= interval) {
                stats.begin();
                eventEmitterInstance.trigger(`updateScene-${activeSceneIndex + 1}`);
                lastTime = time;
                const transitionComplete = transitionManager.update(
                    renderer,
                    deltaTime
                );
                // Check if transition is active
                if (transitionComplete) {
                    // Update active scene index after transition
                    activeSceneIndex = (activeSceneIndex + 1) % scenes.length;
                    setCurrentSceneIndex(activeSceneIndex);
                }
                if (!transitionManager.isTransitioning) {
                    const currentScene = scenes[activeSceneIndex].instance;
                    const camera = scenes[activeSceneIndex].camera;
                    renderer.render(currentScene, camera.instance);
                }
                stats.end();
            }


            requestAnimationFrame(() => animate(tick + 1));
        };

        // Start animation loop
        animate(0);


        // Scene change handler
        const sceneChangeHandler = () => {
            const nextSceneIndex = (activeSceneIndex + 1) % scenes.length;
            const currentScene = scenes[activeSceneIndex].instance;
            const nextScene = scenes[nextSceneIndex].instance;

            // Start transition
            transitionManager.startTransition(currentScene, nextScene, 2);
        };

        // Listen for scene change events
        eventEmitterInstance.on("nextScene", sceneChangeHandler);

        // Handle window resize
        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            scenes.forEach((scene) => {
                scene.camera.handleResize();
            });
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
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
                Current Scene: {currentSceneIndex + 1}
            </div>
        </div>
    );
};

export default ThreeScene;
