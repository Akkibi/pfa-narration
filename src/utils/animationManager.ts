import * as THREE from "three";
import { loadTexture } from "../game/assets";

// Plays a spritesheet (frames left to right, top to bottom) by moving the texture offset.
class Animation {
    private material: THREE.MeshBasicMaterial;
    private texture: THREE.Texture | null = null;
    public speed: number; // ms per frame
    private elapsed: number = 0;
    private currentIndex: number = 0;
    private cols: number;
    private rows: number;
    private frameCount: number;
    private disposed = false;

    constructor(
        material: THREE.MeshBasicMaterial,
        owner: object,
        url: string,
        cols: number,
        rows: number,
        frameCount = cols * rows,
        speed = 100,
    ) {
        this.material = material;
        this.cols = cols;
        this.rows = rows;
        this.frameCount = frameCount;
        this.speed = speed;
        this.material.visible = false;

        loadTexture(url, owner, THREE.SRGBColorSpace).then(
            (base) => {
                if (this.disposed) return;
                const texture = base.clone();
                texture.userData = {};
                texture.repeat.set(1 / cols, 1 / rows);
                this.texture = texture;
                this.applyFrame();
                this.material.map = texture;
                this.material.visible = true;
                this.material.needsUpdate = true;
            },
            () => {},
        );
    }

    public setSpeed = (speed: number) => {
        this.speed = speed;
    };

    public setFrame = (frame: number) => {
        this.currentIndex = Math.floor(frame) % this.frameCount;
        this.applyFrame();
    };

    private applyFrame() {
        if (!this.texture) return;
        const col = this.currentIndex % this.cols;
        const row = Math.floor(this.currentIndex / this.cols);
        this.texture.offset.set(col / this.cols, 1 - (row + 1) / this.rows);
    }

    public update = (_time: number, dt: number) => {
        this.elapsed += (dt * 1000) / 60;
        if (this.elapsed < this.speed) return;
        this.elapsed = Math.min(this.elapsed - this.speed, this.speed);
        this.currentIndex = (this.currentIndex + 1) % this.frameCount;
        this.applyFrame();
    };

    public dispose() {
        this.disposed = true;
        this.texture?.dispose();
        this.texture = null;
    }
}

export default Animation;
