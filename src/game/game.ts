import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { eventEmitterInstance } from "../utils/eventEmitter";
import { gameState } from "./gameState";
import { Scenes } from "../components/contexts/TransitionManager";
import { GameScenes } from "../components/SceneManager";

export class Game {
    public static instance: Game;
    private renderer: THREE.WebGLRenderer | null = null;
    private stats: Stats;
    private animRef: number | null = null;
    private mount: HTMLDivElement | null = null;
    private sceneIndex: Scenes;
    private lastTime: number = Date.now();
    private fps = 70;
    private interval = 1000 / this.fps;
    private currentScene: GameScenes;
    private tick = 0;

    private constructor(sceneIndex: Scenes, scene: GameScenes) {
        this.sceneIndex = sceneIndex;
        this.currentScene = scene;

        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        window.addEventListener("resize", this.handleResize);
    }

    public static getInstance(sceneIndex: Scenes, scene: GameScenes): Game {
        if (!Game.instance) {
            Game.instance = new Game(sceneIndex, scene);
        }
        return Game.instance;
    }

    public start(mount: HTMLDivElement) {
        this.mount = mount;
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
        });
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.mount.appendChild(this.renderer.domElement);

        // Resize handler

        this.animate();

        // Store cleanup
    }

    private handleResize = () => {
        if (!this.renderer) return;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.pixelRatio = window.devicePixelRatio;
        this.currentScene.camera?.handleResize();
    };
    public setScene = (scene: GameScenes, sceneIndex: Scenes) => {
        this.currentScene = scene;
        this.sceneIndex = sceneIndex;
        gameState.currentScene = sceneIndex;
    };

    public cleanup = () => {
        if (!this.mount || !this.renderer) return;
        console.log("EXIT", this.sceneIndex);
        window.removeEventListener("resize", this.handleResize);
        this.renderer.dispose();
        if (this.animRef) cancelAnimationFrame(this.animRef);
        if (this.mount.contains(this.renderer.domElement)) {
            this.mount.removeChild(this.renderer.domElement);
        }
    };

    private animate = () => {
        if (!this.renderer) return;
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= this.interval) {
            this.stats.begin();
            this.tick++;
            eventEmitterInstance.trigger(`updateScene-${gameState.currentScene}`, [this.tick]);
            const camera = this.currentScene.camera;
            if (camera !== null) {
                this.renderer.render(this.currentScene.instance, camera.camera);
            }

            this.stats.end();
            this.lastTime = currentTime;
        }

        this.animRef = requestAnimationFrame(this.animate);
    };
}
