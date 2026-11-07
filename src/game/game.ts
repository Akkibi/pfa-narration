import { WebGPURenderer } from "three/webgpu";
import { gameState } from "./gameState";
import { Scenes } from "../components/contexts/TransitionManager";
import type BaseScene from "./scenes/BaseScene";
import { setMaxTextureSize } from "./assets";

const MAX_PIXEL_RATIO = 1.5;
const FRAME_INTERVAL = 1000 / 70;
const FRAME_TOLERANCE = 2;
const FRAME_60 = 1000 / 60;
const MAX_DT = 3;
const SLOW_FRAME = 28;
const SAMPLE_SIZE = 120;

type BackendLimits = {
    device?: { limits: { maxTextureDimension2D: number } } | null;
    gl?: WebGL2RenderingContext;
};

const readMaxTextureSize = (backend: BackendLimits) => {
    if (backend.device) return backend.device.limits.maxTextureDimension2D;
    if (backend.gl) return backend.gl.getParameter(backend.gl.MAX_TEXTURE_SIZE) as number;
    return 4096;
};

export class Game {
    private static instance: Game | null = null;
    private renderer: WebGPURenderer;
    public readonly ready: Promise<void>;
    private animRef: number | null = null;
    private mount: HTMLDivElement | null = null;
    private currentScene: BaseScene | null = null;
    private lastTime: number | null = null;
    private pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    private sampledFrames = 0;
    private slowFrames = 0;

    private constructor() {
        this.renderer = new WebGPURenderer({
            antialias: true,
            powerPreference: "high-performance",
        });
        this.ready = this.renderer.init().then((renderer) => {
            setMaxTextureSize(readMaxTextureSize(renderer.backend as BackendLimits));
        });
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public static get(): Game {
        return (Game.instance ??= new Game());
    }

    public start(mount: HTMLDivElement) {
        this.mount = mount;
        mount.appendChild(this.renderer.domElement);
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
        this.lastTime = null;
        if (this.animRef === null) this.animRef = requestAnimationFrame(this.animate);
    }

    private handleResize = () => {
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.currentScene?.camera?.handleResize();
    };

    public setScene = (scene: BaseScene, sceneIndex: Scenes) => {
        this.currentScene = scene;
        gameState.currentScene = sceneIndex;
        scene.camera?.handleResize();
    };

    public cleanup = () => {
        window.removeEventListener("resize", this.handleResize);
        if (this.animRef !== null) cancelAnimationFrame(this.animRef);
        this.animRef = null;
        this.currentScene = null;
        const canvas = this.renderer.domElement;
        if (this.mount?.contains(canvas)) this.mount.removeChild(canvas);
        this.mount = null;
    };

    // Drops to 1x when most recent frames miss ~35fps at the capped pixel ratio.
    private monitorPerformance(elapsed: number) {
        if (this.pixelRatio <= 1 || elapsed > 100) return;
        this.sampledFrames++;
        if (elapsed > SLOW_FRAME) this.slowFrames++;
        if (this.sampledFrames < SAMPLE_SIZE) return;
        if (this.slowFrames > SAMPLE_SIZE * 0.6) {
            this.pixelRatio = 1;
            this.handleResize();
        }
        this.sampledFrames = 0;
        this.slowFrames = 0;
    }

    private animate = (now: number) => {
        this.animRef = requestAnimationFrame(this.animate);
        const scene = this.currentScene;
        if (!scene || !this.renderer.initialized) return;
        if (this.lastTime === null) {
            this.lastTime = now;
            return;
        }
        const elapsed = now - this.lastTime;
        if (elapsed < FRAME_INTERVAL - FRAME_TOLERANCE) return;
        this.lastTime = now;

        scene.update(now / 1000, Math.min(elapsed / FRAME_60, MAX_DT));
        const camera = scene.camera;
        if (camera) {
            this.renderer.render(scene.instance, camera.camera);
            this.monitorPerformance(elapsed);
        }
    };
}
